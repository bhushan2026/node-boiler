import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
//import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have this utility

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );
        
        // const refreshToken = jwt.sign(
        //     {
        //         _id: user._id
        //     },
        //     process.env.REFRESH_TOKEN_SECRET,
        //     {
        //         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        //     }
        // );

        // user.refreshToken = refreshToken;
        // await user.save({ validateBeforeSave: false });
        
        // return { accessToken, refreshToken };
        return { accessToken };
    } catch (error) {
        throw new ApiError(500, `Something went wrong while generating tokens : ${error}`);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password, mobileNo, role } = req.body;

    if ([username, email, fullName, password, mobileNo].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }, { mobileNo }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email, username or mobile number already exists");
    }

    // let avatarLocalPath;
    // if (req.file) {
    //     avatarLocalPath = req.file.path;
    // }

    // let avatar;
    // if (avatarLocalPath) {
    //     avatar = await uploadOnCloudinary(avatarLocalPath);
    //     if (!avatar) {
    //         throw new ApiError(400, "Error uploading avatar");
    //     }
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password: hashedPassword,
        mobileNo,
        role: role || "User",
        // avatar: avatar?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponce(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const { accessToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        // .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200, 
                {
                    // user: loggedInUser, accessToken, refreshToken
                    user: loggedInUser, accessToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // await User.findByIdAndUpdate(
    //     req.user._id,
    //     {
    //         $set: {
    //             refreshToken: undefined
    //         }
    //     },
    //     {
    //         new: true
    //     }
    // );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        // .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User logged out"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponce(200, req.user, "User profile fetched successfully")
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, mobileNo } = req.body;
    
    const updatedFields = {};
    
    if (fullName) updatedFields.fullName = fullName;
    if (mobileNo) updatedFields.mobileNo = mobileNo;
    
    // if (req.file) {
    //     const avatarLocalPath = req.file.path;
    //     const avatar = await uploadOnCloudinary(avatarLocalPath);
        
    //     if (avatar) {
    //         updatedFields.avatar = avatar.url;
    //     }
    // }
    
    if (Object.keys(updatedFields).length === 0) {
        throw new ApiError(400, "Nothing to update");
    }
    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updatedFields
        },
        { new: true }
    ).select("-password");
    
    return res.status(200).json(
        new ApiResponce(200, user, "User profile updated successfully")
    );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    
    const user = await User.findById(req.user._id);
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save({ validateBeforeSave: false });
    
    return res.status(200).json(
        new ApiResponce(200, {}, "Password changed successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    changePassword
};