import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri, {
      dbName: "proyecto-backend",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongo conectado a Atlas");
  } catch (err) {
    console.error("Error conectando a Mongo:", err.message);
    process.exit(1);
  }
}
