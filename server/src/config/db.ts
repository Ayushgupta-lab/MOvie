import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dns from 'dns';
import { config } from './env.js';

// Resolve SRV records reliably across Windows and restricted ISP DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting servers is restricted
}

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<string> => {
  let uri = config.mongoUri;

  if (!uri) {
    console.log('⚡ No MONGODB_URI provided. Initializing in-memory MongoDB server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected successfully to: ${uri.startsWith('mongodb+srv') ? 'MongoDB Atlas' : uri.split('@')[1] || uri}`);
    return uri;
  } catch (error) {
    if (!mongoMemoryServer) {
      console.warn('⚠️ Failed to connect to specified MONGODB_URI. Falling back to in-memory MongoDB server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ In-memory MongoDB connected: ${uri}`);
      return uri;
    }
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
