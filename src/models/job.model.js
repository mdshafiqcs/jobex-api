import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  
  jobRole: {
    type: String,
    required: true,
  },

  requirements: [{ type: String }],

  salary: {
    type: Number,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  jobType: {
    type: String,
    required: true,
  },

  positions: {
    type: Number,
    required: true,
  },

  experienceLevel: {
    type: String,
    required: true,
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  

}, {timestamps: true})

jobSchema.plugin(mongooseAggregatePaginate);



export const Job = mongoose.model("Job", jobSchema);