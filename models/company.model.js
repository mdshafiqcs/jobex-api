import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const companySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  website: {
    type: String,
  },

  location: {
    type: String,
  },

  logo: {
    type: String,
    default: "https://github.com/shadcn.png",
  },

  cloudinaryPublicId: {
    logo: { type: String },
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
  
}, {timestamps: true})

companySchema.plugin(mongooseAggregatePaginate);

export const Company = mongoose.model("Company", companySchema)