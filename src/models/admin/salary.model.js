import mongoose from "mongoose";


const salarySchema = new mongoose.Schema({
  min: {
    type: Number,
    required: true,
  },

  max: Number,

}, {timestamps: false})  

export const Salary = mongoose.model("Salary", salarySchema)