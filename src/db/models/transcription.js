import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

transcriptionSchema.index({ userId: 1, createdAt: -1 });
export const TranscriptionCollection = mongoose.model('Transcription', transcriptionSchema);
