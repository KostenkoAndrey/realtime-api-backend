import fs from 'fs/promises';
import { createReadStream } from 'fs';
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

  await fs.writeFile(tempFilePath, wavBuffer);

  try {
    const transcription = await transcribeAudio(tempFilePath, openai);

    await fs.unlink(tempFilePath);

    ws.send(
      JSON.stringify({
        type: isFinal ? 'transcript_final' : 'transcript_chunk',
        text: transcription.text,
        chunkNumber: chunkNumber,
      }),
    );

    return transcription.text;
  } catch (error) {
    try {
      await fs.unlink(tempFilePath);
    } catch {}

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
  const fileStream = createReadStream(filePath);

  return await openai.audio.transcriptions.create({
    file: fileStream,
    model: 'whisper-1',
    language: 'ru',
    response_format: 'json',
  });
}
