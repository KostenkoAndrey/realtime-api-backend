import createHttpError from 'http-errors';

export function parseMessage(message) {
  if (message instanceof Buffer || message instanceof ArrayBuffer) {
    const buffer = Buffer.from(message);

    if (buffer.length < 100) {
      try {
        const text = buffer.toString('utf8');
        const data = JSON.parse(text);
        return { isCommand: true, data };
      } catch (e) {
        return { isAudio: true, buffer };
      }
    }

    return { isAudio: true, buffer };
  }

  try {
    const data = JSON.parse(message.toString());
    return { isCommand: true, data };
  } catch (e) {
    throw createHttpError('Invalid message format');
  }
}
