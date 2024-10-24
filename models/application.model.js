import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ApplicationStatusEnum } from "../constants.js"


const applicatonShcema = new mongoose.Schema({

  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },

  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: [ApplicationStatusEnum.pending, ApplicationStatusEnum.accepted, ApplicationStatusEnum.rejected],
    default: "pending",
  },

}, {timestamps: true})

applicatonShcema.plugin(mongooseAggregatePaginate);

export const Application = mongoose.model("Application", applicatonShcema)