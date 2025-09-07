import mongoose from "mongoose";

let isConnected = false;

export const connectDb = async () => {
  if (isConnected) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");

  await mongoose.connect(process.env.MONGO_URI, { dbName: "gymApp" });
  isConnected = true;
  console.log("✅ DB connected");
};