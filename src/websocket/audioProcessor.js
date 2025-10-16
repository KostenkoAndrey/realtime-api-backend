import fs from 'fs';
import path from 'path';
import { createWavBuffer } from '../utils/wavUtils.js';
import { ensureTempDir } from '../utils/fileUtils.js';

export async function processAudioChunk(audioBuffer, ws, openai, chunkNumber, isFinal, user) {
  if (audioBuffer.length === 0) {
    return null;
  }

  const totalLength = audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
  const completeBuffer = Buffer.concat(audioBuffer, totalLength);

  const wavBuffer = createWavBuffer(completeBuffer, 48000, 1);

  const tempDir = ensureTempDir();
  const tempFilePath = path.join(tempDir, `audio_chunk_${Date.now()}_${chunkNumber}.wav`);

  fs.writeFileSync(tempFilePath, wavBuffer);

  try {
    const transcription = await transcribeAudio(tempFilePath, openai);

    fs.unlinkSync(tempFilePath);

    ws.send(
      JSON.stringify({
        type: isFinal ? 'transcript_final' : 'transcript_chunk',
        text: transcription.text,
        chunkNumber: chunkNumber,
      }),
    );

    return transcription.text;
  } catch (error) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    ws.send(
      JSON.stringify({
        type: 'error',
        error: { message: error.message },
        chunkNumber: chunkNumber,
      }),
    );

    return null;
  }
}

async function transcribeAudio(filePath, openai) {
  const fileStream = fs.createReadStream(filePath);

  return await openai.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-1',
    language: 'ru',
    response_format: 'json',
  });
}
