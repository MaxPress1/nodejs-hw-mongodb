import mongoose from "mongoose";

import { getEnvVar } from "../utils/getEnvVar.js";


const initMongoConnection = async () => {
    try {
  const user = getEnvVar('MONGODB_USER');
  const pwd = getEnvVar('MONGODB_PASSWORD');
    const url = getEnvVar('MONGODB_URL');
    const db = getEnvVar('MONGODB_DB');

    const mongoUri = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`;

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export default initMongoConnection;