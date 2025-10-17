import { processAudioChunk } from './audioProcessor.js';
import { parseMessage } from '../utils/messageParser.js';
import { TranscriptionCollection } from '../db/models/transcription.js';

export const handleAudioConnection = (ws, openai) => {
  console.log(`🔌 New WebSocket connection, user: ${ws.user?.email}, userId: ${ws.user?._id}`);

  const state = {
    audioBuffer: [],
    isRecording: false,
    chunkCounter: 0,
    processingChunk: false,
    fullTranscription: '',
  };

  ws.on('message', async (message) => {
    try {
      console.log(
        `📨 RAW message received, type: ${typeof message}, isBuffer: ${Buffer.isBuffer(message)}, length: ${message.length}`,
      );

      // Если это маленькое сообщение, покажем его содержимое
      if (message.length < 200) {
        try {
          console.log(`📨 RAW content:`, message.toString('utf8'));
        } catch (e) {
          console.log(`📨 Cannot convert to string:`, e.message);
        }
      }

      const parsed = parseMessage(message);
      console.log(`📦 Parsed result: isCommand=${parsed.isCommand}, isAudio=${parsed.isAudio}`);

      if (parsed.isCommand) {
        console.log(`📨 Command received: ${parsed.data.type}`);
        console.log(`📨 Command data:`, parsed.data);
        await handleCommand(parsed.data, state, ws, openai, ws.user);
      } else if (parsed.isAudio) {
        state.audioBuffer.push(parsed.buffer);
        console.log(`🎤 Audio chunk added, buffer size: ${state.audioBuffer.length}, bytes: ${parsed.buffer.length}`);
      } else {
        console.warn(`⚠️ Message is neither command nor audio`);
      }
    } catch (error) {
      console.error(`❌ WebSocket message handler error for user ${ws.user?.email}:`, error);
      console.error(`❌ Error stack:`, error.stack);
      ws.send(
        JSON.stringify({
          type: 'error',
          error: { message: error.message },
        }),
      );
    }
  });

  ws.on('close', () => {
    console.log(`👋 WebSocket closed for user: ${ws.user?.email}`);
    state.isRecording = false;
    state.audioBuffer = [];
    state.fullTranscription = '';
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for user ${ws.user?.email}:`, error);
  });
};

async function handleCommand(data, state, ws, openai, user) {
  console.log(`⚙️ Handling command: ${data.type}, user: ${user?.email}`);

  switch (data.type) {
    case 'start_recording': {
      state.isRecording = true;
      state.audioBuffer = [];
      state.chunkCounter = 0;
      state.fullTranscription = '';

      const response = JSON.stringify({ type: 'recording_started' });
      console.log(`📤 Sending response:`, response);
      ws.send(response);
      console.log('🎙️ Recording started');
      break;
    }

    case 'stop_recording': {
      console.log('🛑 Stop recording command received');
      state.isRecording = false;

      let waitAttempts = 0;
      const maxWaitAttempts = 150;

      console.log(`⏳ Waiting for chunk processing to complete... (processingChunk: ${state.processingChunk})`);
      while (state.processingChunk && waitAttempts < maxWaitAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitAttempts++;
      }
      console.log(`✅ Wait complete after ${waitAttempts * 100}ms`);

      console.log(`📊 Audio buffer length: ${state.audioBuffer.length}`);

      if (state.audioBuffer.length > 0) {
        state.chunkCounter++;
        console.log(`🎬 Processing final chunk #${state.chunkCounter}`);

        const text = await processAudioChunk(state.audioBuffer, ws, openai, state.chunkCounter, true, user);

        console.log(`📝 Final chunk result: "${text}"`);

        if (text) {
          state.fullTranscription += (state.fullTranscription ? ' ' : '') + text;
        }
      }

      console.log(`⏱️ Waiting 2 seconds before saving...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`💬 Full transcription to save: "${state.fullTranscription}"`);
      console.log(`👤 User object:`, {
        exists: !!user,
        _id: user?._id,
        email: user?.email,
      });

      if (state.fullTranscription.trim()) {
        try {
          console.log(`💾 Attempting to save transcription...`);

          const transcription = await TranscriptionCollection.create({
            userId: user._id,
            text: state.fullTranscription.trim(),
          });

          console.log(`✅ Transcription saved with ID: ${transcription._id}`);

          const responseMessage = JSON.stringify({
            type: 'transcription_saved',
            transcriptionId: transcription._id,
            fullText: transcription.text,
          });

          console.log(`📤 Sending to client:`, responseMessage);
          ws.send(responseMessage);
        } catch (error) {
          console.error('❌ Failed to save transcription:', error);
          console.error('Error details:', error.message, error.stack);
          ws.send(
            JSON.stringify({
              type: 'error',
              error: { message: 'Failed to save transcription' },
            }),
          );
        }
      } else {
        console.warn('⚠️ No text to save (empty transcription)');
        ws.send(
          JSON.stringify({
            type: 'transcription_saved',
            fullText: '',
            message: 'No text to save',
          }),
        );
      }

      state.audioBuffer = [];
      state.fullTranscription = '';
      console.log('🧹 State cleaned up');
      break;
    }

    case 'process_chunk': {
      console.log(
        `🔄 Process chunk command, buffer: ${state.audioBuffer.length}, processing: ${state.processingChunk}, recording: ${state.isRecording}`,
      );

      if (state.audioBuffer.length > 0 && !state.processingChunk && state.isRecording) {
        state.processingChunk = true;
        state.chunkCounter++;

        const chunkToProcess = [...state.audioBuffer];
        state.audioBuffer = [];

        console.log(`🎬 Processing chunk #${state.chunkCounter}, size: ${chunkToProcess.length}`);

        processAudioChunk(chunkToProcess, ws, openai, state.chunkCounter, false, user)
          .then((text) => {
            console.log(`✅ Chunk #${state.chunkCounter} result: "${text}"`);
            if (text) {
              state.fullTranscription += (state.fullTranscription ? ' ' : '') + text;
              console.log(`📝 Updated full transcription: "${state.fullTranscription}"`);
            }
          })
          .catch((error) => {
            console.error(`❌ Error processing chunk ${state.chunkCounter}:`, error);
            ws.send(
              JSON.stringify({
                type: 'error',
                error: { message: 'Failed to process audio chunk' },
              }),
            );
          })
          .finally(() => {
            state.processingChunk = false;
            console.log(`✅ Chunk #${state.chunkCounter} processing complete`);
          });
      } else {
        console.warn(
          `⚠️ Skipping chunk processing: buffer=${state.audioBuffer.length}, processing=${state.processingChunk}, recording=${state.isRecording}`,
        );
      }
      break;
    }

    default:
      console.warn(`⚠️ Unknown command type: ${data.type}`);
  }
}
