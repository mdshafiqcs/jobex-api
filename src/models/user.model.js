import mongoose from "mongoose";
import config from "../utils/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { UserRoleEnum } from "../constants.js"

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: [UserRoleEnum.jobseeker, UserRoleEnum.recruiter],
    required: true,
  },

  profile: {
    bio: {type: String},
    skills: [{type: String}],
    resume: {type: String},
    resumeOriginalName: {type: String},
    company: {type: mongoose.Schema.Types.ObjectId, ref: "Company"},
    profilePhoto: {type: String, default: "https://github.com/shadcn.png"}
  },

  cloudinaryPublicId: {
    profilePhoto: { type: String },
    resume: { type: String },
  },

  refreshToken: {
    type: String,
  }

}, {timestamps: true})


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiry,
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiry,
    }
  )
}

export const User = mongoose.model("User", userSchema)