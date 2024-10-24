import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connection !! Host: ", connectionInstance.connection.host);
  } catch (error) {
    console.log("Database Connection Error, ", error)
    process.exit(1);
  }
}

export default connectDB;