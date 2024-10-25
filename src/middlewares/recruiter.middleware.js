import jwt from "jsonwebtoken";
import { ApiError, asyncHandler } from "../utils/index.js";
import { User } from "../models/index.js"
import config from "../utils/config.js";
import { UserRoleEnum } from "../constants.js"


const recruiter = asyncHandler(async(req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken ;

    if(!token){
      throw new ApiError(401, "Unauthorized Request");
    }
  
    const decodedToken = jwt.verify(token, config.accessTokenSecret)
  
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
    if(!user){
      next(new ApiError(401, "Unauthorized Request"));
    }

    if(user.role !== UserRoleEnum.recruiter ){
      
      next(new ApiError(403, "Access Denined", null, {message: `This route is not accessible for this user role (${UserRoleEnum.recruiter}), please check the Api Endpoint and accessToken`}));
    }
  
    req.user = user;
    next()
  } catch (error) {
    next(new ApiError(401, error?.message || "Invalid Access Token"));
  }
})

export default recruiter;