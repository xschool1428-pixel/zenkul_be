import Joi from 'joi';

export const initiateFeeSchema = Joi.object({
  body: Joi.object({
    invoiceId: Joi.string().required(),
    idempotencyKey: Joi.string().optional(),
  }).required(),
});

export const verifyPaymentSchema = Joi.object({
  body: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }).required(),
});

export const initiatePlatformSchema = Joi.object({
  body: Joi.object({
    idempotencyKey: Joi.string().optional(),
    seatCount: Joi.number().integer().min(1).optional(),
  }).required(),
});
