import mongoose, { Schema } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getOrSetCache } from "../utils/redis.js";

const getLeaderboardfromDB = async () => {
    // fetch all the users and their accumulated scores
    const leaderboard = await User.aggregate([
        {
            $project:{
                _id: 0,
                username: 1,
                accumulated_Score: 1
            }
        },
        {
           $sort: {accumulated_Score: -1} // sorted in descending order
        }
    ])

    if(!leaderboard){
        console.log(leaderboard);
        throw new ApiError(400, "error fetching leaderboard leaerboard")   
    }

    return leaderboard;
}

const getLeaderboard = asyncHandler(async (req, res) => {

   try {

     const redisLeaderboard = await getOrSetCache("leaderboard", () => getLeaderboardfromDB());


     if(!redisLeaderboard){
        console.log(redisLeaderboard);
        throw new ApiError(400, "error fetching leaderboard")   
    }
     return res
     .status(200)
     .json(new ApiResponse(200, redisLeaderboard, "Fetched the leaderboard succsfully"))
   } catch (error) {
    console.error("Internal server error", error);
    throw new ApiError (400, "something wrong happened")
   }
})

export {
    getLeaderboard
}