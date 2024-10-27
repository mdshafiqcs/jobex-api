import mongoose from "mongoose";


const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
}, {timestamps: false})  

export const Location = mongoose.model("Location", locationSchema)