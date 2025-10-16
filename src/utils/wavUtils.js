export function createWavBuffer(pcmBuffer, sampleRate, channels) {
  const wavHeader = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + dataLength, 4);
  wavHeader.write('WAVE', 8);

  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(channels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * channels * 2, 28);
  wavHeader.writeUInt16LE(channels * 2, 32);
  wavHeader.writeUInt16LE(16, 34);

  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataLength, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}
