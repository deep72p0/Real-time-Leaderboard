import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save ({ validateBeforeSave: false })

        return {accessToken, refreshToken};
    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const registerUser = asyncHandler (async (req, res) => {
    
    // get the user details from front-end
    const { fullname, email, username, password } = req.body

    // validation
    if(
        [fullname, email, username, password].some((field) => field?.trim === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if a user already exists: username, email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existingUser) {
        throw new ApiError(400, "User with email o username already exists")
    }

    // create user object
    try{
        const createdUser = await User.create({
            username: username.toLowerCase(),
            fullname,
            email,
            password
        })

        // remove password and refresh token field from response
        const user = await User.findById(createdUser._id).select(
            "-password -refreshToken"
        )
        
        // check for user creation
        if(!user) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        // return response
        return res
        .status(201)
        .json(new ApiResponse(200, user, "User registered successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while registering user")
    }
})

const loginUser = asyncHandler( async (req, res) => {
    // req body -> data
    const { email, username, password } = req.body;

    // username or email
    if(!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
     
    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //access and referesh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    if(!accessToken || !refreshToken){
        throw new ApiError(400, "Failed to generate any accessToken or refreshToken")
    }

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken");
    
    //set options for cookies
    const options = {
        httpOnly: true,
        secure: true // for http || set: "true" if using https,
        // sameSite: "Lax" // ensures cookies work across origins
    }

    // return response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1 // this removes the field an ends the session
            } 
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(201)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler (async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user) {
             throw new ApiError(401, "Refresh  token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res 
        .status(200)
        .cookie("acccesToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json( new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body;

    if(!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res 
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
}