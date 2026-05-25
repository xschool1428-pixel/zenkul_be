import mongoose from 'mongoose';

const studentAddressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    addressType: { type: String, default: 'permanent' },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    countryCode: { type: String, default: 'IN' },
    isPrimary: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StudentAddress = mongoose.model('StudentAddress', studentAddressSchema);
