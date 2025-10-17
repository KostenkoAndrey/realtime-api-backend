import { processAudioChunk } from './audioProcessor.js';
import { parseMessage } from '../utils/messageParser.js';
import { TranscriptionCollection } from '../db/models/transcription.js';

export const handleAudioConnection = (ws, openai) => {
  const state = {
    audioBuffer: [],
    isRecording: false,
    chunkCounter: 0,
    processingChunk: false,
    fullTranscription: '',
    pendingPromises: [],
    isStopping: false,
  };

  ws.on('message', async (message) => {
    try {
      const parsed = parseMessage(message);

      if (parsed.isCommand) {
        await handleCommand(parsed.data, state, ws, openai, ws.user);
      } else if (parsed.isAudio) {
        if (state.isRecording) {
          state.audioBuffer.push(parsed.buffer);
        }
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'error',
          error: { message: error.message },
        }),
      );
    }
  });

  ws.on('close', () => {
    if (!state.isStopping) {
      state.isRecording = false;
      state.audioBuffer = [];
      state.fullTranscription = '';
    }
  });

  ws.on('error', (error) => {});
};

async function handleCommand(data, state, ws, openai, user) {
  switch (data.type) {
    case 'start_recording': {
      state.isRecording = true;
      state.audioBuffer = [];
      state.chunkCounter = 0;
      state.fullTranscription = '';
      state.pendingPromises = [];
      state.isStopping = false;
      ws.send(JSON.stringify({ type: 'recording_started' }));
      break;
    }

    case 'stop_recording': {
      state.isRecording = false;
      state.isStopping = true;

      if (state.pendingPromises.length > 0) {
        await Promise.allSettled(state.pendingPromises);
      }

      let waitAttempts = 0;
      const maxWaitAttempts = 150;

      while (state.processingChunk && waitAttempts < maxWaitAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitAttempts++;
      }

      if (state.audioBuffer.length > 0) {
        state.chunkCounter++;

        const text = await processAudioChunk(state.audioBuffer, ws, openai, state.chunkCounter, true, user);

        if (text) {
          state.fullTranscription += (state.fullTranscription ? ' ' : '') + text;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (state.fullTranscription.trim()) {
        try {
          const transcription = await TranscriptionCollection.create({
            userId: user._id,
            text: state.fullTranscription.trim(),
          });

          ws.send(
            JSON.stringify({
              type: 'transcription_saved',
              transcriptionId: transcription._id,
              fullText: transcription.text,
            }),
          );
        } catch (error) {
          console.error(`[CMD] Failed to save transcription:`, error);
          ws.send(
            JSON.stringify({
              type: 'error',
              error: { message: 'Failed to save transcription' },
            }),
          );
        }
      } else {
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
      state.pendingPromises = [];
      state.isStopping = false;
      break;
    }

    case 'process_chunk': {
      if (state.audioBuffer.length > 0 && !state.processingChunk && state.isRecording) {
        state.processingChunk = true;
        state.chunkCounter++;

        const chunkToProcess = [...state.audioBuffer];
        state.audioBuffer = [];

        const processingPromise = processAudioChunk(chunkToProcess, ws, openai, state.chunkCounter, false, user)
          .then((text) => {
            if (text) {
              state.fullTranscription += (state.fullTranscription ? ' ' : '') + text;
            }
          })
          .catch((error) => {
            ws.send(
              JSON.stringify({
                type: 'error',
                error: { message: 'Failed to process audio chunk' },
              }),
            );
          })
          .finally(() => {
            state.processingChunk = false;

            const index = state.pendingPromises.indexOf(processingPromise);
            if (index > -1) {
              state.pendingPromises.splice(index, 1);
            }
          });

        state.pendingPromises.push(processingPromise);
      }
      break;
    }

    default:
      break;
  }
}
