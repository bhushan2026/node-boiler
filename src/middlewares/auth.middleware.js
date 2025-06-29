import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js";


const jwtVerify = asyncHandler(async(req, res, next) => {
    try{
        const token = req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
            throw new ApiError(401, "Unauthorized Request");
        }

        const decoded = await jwt.decode(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findOne({ username: decoded?.username }).select("-password")

        if(!user){
            throw new ApiError(401, "Invalid token")
        }

        req.user = user;
        next();
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid Access token");
    }
})


const adminVerify = asyncHandler(async(req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "Unauthorized request")
    }

    if(user.role !== "Admin"){
        throw new ApiError(401, "You Are Not Admin User");
    }

    next();
})

export {jwtVerify, adminVerify}