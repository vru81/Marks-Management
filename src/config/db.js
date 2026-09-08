import mongoose from 'mongoose';
import { mongoOptions } from '../utils/mongoOptions.js';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri, mongoOptions);
  console.log('MongoDB connected');
}
