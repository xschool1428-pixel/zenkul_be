import { Invoice, Student } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import { paginate } from '../utils/pagination.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const { studentId, academicYearId, lines, dueAt } = req.body;

  const student = await Student.findOne({ _id: studentId, schoolId: req.schoolId });
  if (!student) throw new NotFoundError('Student not found');

  const subtotalPaise = lines.reduce((s, l) => s + l.lineTotalPaise, 0);
  const invoiceNumber = `INV-${Date.now()}`;

  const invoice = await Invoice.create({
    schoolId: req.schoolId,
    studentId,
    academicYearId,
    invoiceNumber,
    lines,
    subtotalPaise,
    totalPaise: subtotalPaise,
    status: 'issued',
    issuedAt: new Date(),
    dueAt,
    createdBy: req.userId,
  });

  res.status(201).json({ success: true, data: invoice });
});

export const listInvoices = asyncHandler(async (req, res) => {
  const filter = { schoolId: req.schoolId };
  if (req.query.studentId) filter.studentId = req.query.studentId;
  if (req.query.status) filter.status = req.query.status;

  const { items, meta } = await paginate(Invoice, filter, req.query);
  res.json({ success: true, data: items, meta });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, schoolId: req.schoolId });
  if (!invoice) throw new NotFoundError('Invoice not found');
  res.json({ success: true, data: invoice });
});
