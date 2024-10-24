import { User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler  } from "../utils/index.js"
import bcrypt from "bcrypt"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/index.js";


const cookieOptions = {
  httpOnly: true, 
  secure: true, // process.env.NODE_ENV === 'production',
  // maxAge: 1*24*60*60*1000, 
  sameSite: "None"
}

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
  
    if(!user){
      throw new ApiError(404, "User not found to generate access tokens");
    }
  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
  
    user.refreshToken = refreshToken;
    await user.save();
  
    return {accessToken, refreshToken};
  } catch (error) {
    
    throw new ApiError(500, `Something went wrong while generating access and refresh tokens: ${error}`)
  }

}

export const register = asyncHandler(async(req, res) => {
  const {fullname, email, password, role} = req.body;
  
  const existingUser = await User.findOne({email});
  if(existingUser){
    throw new ApiError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({fullname, email, password: hashedPassword, role});

  if(user){

    return res.status(201)
    .json(
      new ApiResponse(201, { }, "Account created Successfully, now login to continue.")
    );

  } else {
    throw new ApiError(500, "Something went wrong while creating User");
  }
})

export const login = asyncHandler(async (req, res) => {
  const {email, password, role} = req.body;

  const user = await User.findOne({email, role});
  if(!user){
    throw new ApiError(404, "Account not exists with this email and role");
  }

  const passwordOk = await user.isPasswordCorrect(password);

  if(!passwordOk){
    throw new ApiError(400, "wrong password entered");
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

  user.password = undefined;
  user.refreshToken = undefined;

  return res.status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {
        user,
        accessToken,
        refreshToken,
      }, `Welcome back ${user.fullname}`)
    );
})

export const getUser = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.status(200).json(
    new ApiResponse(200, { user }, "" ),
  )
})

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {refreshToken: undefined}
    }
  );

  return res.status(200)
  .clearCookie("accessToken", cookieOptions)
  .clearCookie("refreshToken", cookieOptions)
  .json(
    new ApiResponse(200, null, "Logout Successful")
  )
})



export const updateProfile = asyncHandler(async (req, res) => {
  const {fullname, phone, bio, skills} = req.body;

  const user = req.user;

  if(req.files && Array.isArray(req.files.profilePhoto) && req.files.profilePhoto.length > 0){
    let localPath = req.files.profilePhoto[0].path;

    let profilePhoto;

    if(localPath) {
      profilePhoto = await uploadOnCloudinary(localPath);
    }

    if(profilePhoto){
      if(user.cloudinaryPublicId?.profilePhoto){
        await deleteFromCloudinary(user.cloudinaryPublicId?.profilePhoto);
      }
      user.profile.profilePhoto = profilePhoto.url;
      user.cloudinaryPublicId.profilePhoto = profilePhoto.public_id;
    }
  }

  user.fullname = fullname;
  user.phone = phone;
  user.profile.bio = bio;

  if(skills === ""){
    user.profile.skills = []
  } else if(skills && skills !== ""){
    let skillsArray = skills ? skills.split(",") : undefined;
    skillsArray = skillsArray?.filter((item) => {
      if(item){
        return item;
      }
    })
    
    if(skillsArray) {
      user.profile.skills = skillsArray.map((skill) => skill.toString().trim());
    };
  }

  // other profile section comes here later

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {user}, "Profile Updated Successfully!!")
  )
})



export const updateResume = asyncHandler(async (req, res) => {

  const user = req.user;

  if(req.files && Array.isArray(req.files.resume) && req.files.resume.length > 0){
    let localPath = req.files.resume[0].path;

    if(!localPath) {
      throw new ApiError(400, "Please select a resume pdf file");
    }

    let resume = await uploadOnCloudinary(localPath);

    if(resume){
      if(user.cloudinaryPublicId?.resume){
        await deleteFromCloudinary(user.cloudinaryPublicId?.resume);
      }
      user.profile.resume = resume.url;
      user.profile.resumeOriginalName = req.files.resume[0].originalname;
      user.cloudinaryPublicId.resume = resume.public_id;

      await user.save();

      const resumeData = {
        resume: user.profile.resume, 
        resumeOriginalName:  user.profile.resumeOriginalName 
      }

      return res.status(200).json(
        new ApiResponse(200, resumeData, "Resume Uploaded Successfully!!")
      )

    } else {
      throw new ApiError(500, "Failed to upload resume");
    }
  } else {
    throw new ApiError(400, "Please select a resume pdf file")
  }
})



