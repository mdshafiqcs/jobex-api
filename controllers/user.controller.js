import { User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler  } from "../utils/index.js"
import bcrypt from "bcrypt"


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
