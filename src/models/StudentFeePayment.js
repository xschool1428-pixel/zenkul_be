import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_PURPOSE } from '../constants/enums.js';

/**
 * Student/parent fee payment — money routed to school's Razorpay linked account via Route transfers.
 */
const studentFeePaymentSchema = new mongoose.Schema(
  {
    purpose: { type: String, default: PAYMENT_PURPOSE.STUDENT_FEE },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    paidByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amountPaise: { type: Number, required: true },
    platformFeePaise: { type: Number, default: 0 },
    schoolAmountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: String,
    status: { type: String, enum: PAYMENT_STATUS, default: 'pending' },
    idempotencyKey: { type: String, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpayTransferIds: [String],
    razorpayLinkedAccountId: String,
    receiptNumber: String,
    paidAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

studentFeePaymentSchema.index({ schoolId: 1, idempotencyKey: 1 }, { unique: true });
studentFeePaymentSchema.index({ razorpayOrderId: 1 });

export const StudentFeePayment = mongoose.model('StudentFeePayment', studentFeePaymentSchema);
