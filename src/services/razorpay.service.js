import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

let instance;

function getRazorpay() {
  if (!instance) {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      throw new AppError('Razorpay is not configured', 503, 'RAZORPAY_NOT_CONFIGURED');
    }
    instance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return instance;
}

/**
 * Create Razorpay Route linked account for a school (KYC onboarding).
 * Docs: https://razorpay.com/docs/payments/route/
 */
export async function createLinkedAccount(school, contactEmail) {
  const rzp = getRazorpay();
  const account = await rzp.accounts.create({
    email: contactEmail || school.email,
    phone: school.phone || '9999999999',
    type: 'route',
    legal_business_name: school.name,
    business_type: 'education',
    contact_name: school.name,
    profile: {
      category: 'education',
      subcategory: 'school',
      addresses: {
        registered: {
          street1: school.addressLine1 || 'NA',
          city: school.city || 'NA',
          state: school.state || 'NA',
          postal_code: school.postalCode || '000000',
          country: school.countryCode || 'IN',
        },
      },
    },
  });
  return account;
}

export async function createLinkedAccountStakeholder(linkedAccountId, director) {
  const rzp = getRazorpay();
  return rzp.stakeholders.create(linkedAccountId, {
    name: director.name,
    email: director.email,
    addresses: director.addresses,
    kyc: director.kyc,
    notes: director.notes,
  });
}

export async function requestLinkedAccountProduct(linkedAccountId, tncAccepted = true) {
  const rzp = getRazorpay();
  const productId = config.razorpay.routeProductId;
  if (!productId) {
    throw new AppError('RAZORPAY_ROUTE_PRODUCT_ID is required for Route onboarding', 503);
  }
  return rzp.products.requestProductConfiguration(linkedAccountId, productId, { tnc_accepted: tncAccepted });
}

/**
 * Student fee order — transfer goes to school's linked account.
 */
export async function createStudentFeeOrder({
  amountPaise,
  schoolLinkedAccountId,
  platformFeePaise,
  receipt,
  notes,
}) {
  const rzp = getRazorpay();
  const schoolAmount = amountPaise - (platformFeePaise || 0);

  const transfers = [
    {
      account: schoolLinkedAccountId,
      amount: schoolAmount,
      currency: 'INR',
      on_hold: false,
    },
  ];

  const order = await rzp.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
    transfers,
  });

  return order;
}

/**
 * Platform subscription order — full amount to platform account (no transfer).
 */
export async function createPlatformOrder({ amountPaise, receipt, notes }) {
  const rzp = getRazorpay();
  return rzp.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes,
  });
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(body, signature) {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export async function fetchPayment(paymentId) {
  const rzp = getRazorpay();
  return rzp.payments.fetch(paymentId);
}

export async function fetchOrder(orderId) {
  const rzp = getRazorpay();
  return rzp.orders.fetch(orderId);
}
