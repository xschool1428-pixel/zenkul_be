import mongoose from 'mongoose';

const guardianSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true },
    lastName: String,
    email: String,
    phone: { type: String, required: true },
    occupation: String,
    aadhaarEncrypted: { type: String, select: false },
    aadhaarLast4: String,
  },
  { timestamps: true }
);

export const Guardian = mongoose.model('Guardian', guardianSchema);
