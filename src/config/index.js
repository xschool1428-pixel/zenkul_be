import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: ${key} is not set in environment`);
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_saas',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  pii: {
    aadhaarEncryptionKey: process.env.AADHAAR_ENCRYPTION_KEY || process.env.JWT_ACCESS_SECRET,
  },
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    autoBootstrap: process.env.SUPER_ADMIN_AUTO_BOOTSTRAP !== 'false',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    platformFeePaise: parseInt(process.env.RAZORPAY_PLATFORM_FEE_PAISE || '0', 10),
    routeProductId: process.env.RAZORPAY_ROUTE_PRODUCT_ID,
  },
  billing: {
    /** Default ₹50 per active user per month */
    defaultPricePerUserPaise: parseInt(process.env.DEFAULT_PRICE_PER_USER_PAISE || '5000', 10),
    billingPeriodDays: parseInt(process.env.BILLING_PERIOD_DAYS || '30', 10),
    gracePeriodDays: parseInt(process.env.GRACE_PERIOD_DAYS || '5', 10),
  },
};
