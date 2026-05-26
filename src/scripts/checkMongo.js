import mongoose from 'mongoose';
import { config } from '../config/index.js';

function redactMongoUri(uri = '') {
  return uri.replace(/\/\/([^:@]+):([^@]+)@/, '//$1:<redacted>@');
}

function getMongoHint(errorMessage = '') {
  if (/querySrv ECONNREFUSED/i.test(errorMessage)) {
    return [
      'Atlas SRV DNS lookup failed.',
      'Your network or DNS resolver is refusing the _mongodb._tcp lookup used by mongodb+srv URIs.',
      'Try the Atlas standard connection string (non-SRV) from the Connect dialog, or switch DNS/network and retry.',
    ].join(' ');
  }

  if (/Authentication failed|bad auth/i.test(errorMessage)) {
    return 'Atlas user or password is incorrect. Recheck the database user credentials in the connection string.';
  }

  if (/IP.*not allowed|whitelist|not authorized/i.test(errorMessage)) {
    return 'Atlas rejected the client network. Confirm your current IP is allowed in Atlas Network Access.';
  }

  if (/ENOTFOUND|getaddrinfo/i.test(errorMessage)) {
    return 'DNS could not resolve the Atlas hostname. Check the cluster host, internet access, and DNS settings.';
  }

  return null;
}

async function main() {
  const uri = config.mongodbUri;

  if (!uri) {
    console.error('MONGODB_URI is missing.');
    process.exit(1);
  }

  console.log('Checking MongoDB connection...');
  console.log(`URI: ${redactMongoUri(uri)}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const admin = mongoose.connection.db.admin();
    const ping = await admin.command({ ping: 1 });

    console.log('MongoDB ping succeeded.');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Ping response: ${JSON.stringify(ping)}`);
  } catch (error) {
    const hint = getMongoHint(error?.message || '');

    console.error('MongoDB connection check failed.');
    console.error(`Error: ${error?.message || error}`);
    if (hint) {
      console.error(`Hint: ${hint}`);
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();
