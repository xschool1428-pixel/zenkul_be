import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../constants/enums.js';

const invoiceLineSchema = new mongoose.Schema(
  {
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitAmountPaise: { type: Number, required: true },
    lineTotalPaise: { type: Number, required: true },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    invoiceNumber: { type: String, required: true },
    status: { type: String, enum: INVOICE_STATUS, default: 'draft' },
    lines: [invoiceLineSchema],
    subtotalPaise: { type: Number, default: 0 },
    discountPaise: { type: Number, default: 0 },
    taxPaise: { type: Number, default: 0 },
    totalPaise: { type: Number, default: 0 },
    amountPaidPaise: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    issuedAt: Date,
    dueAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.index({ schoolId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ studentId: 1, status: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
