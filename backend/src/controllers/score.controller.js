import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Game } from "../models/game.model.js"
import { Score } from "../models/score.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import {gameData} here OR

const calculateScore = (playtime, achievements, kills, winRate, rank) => {

    // OR fetch the rankList from game against the gameName
    // OR gameData.name.rankList
    // example rank list (have to receive the rank lists from the game itself)
    let rankList = [
        "Gold", "Divine", "Ascendant", "Ultra" 
        //"Beginner", "Great", "Expert", "Veteran", "Ultra", "Master"
    ];
    
    //calculate the rankScore
    let rankScore = 0;

    if(rankList.includes(rank)){
        rankScore = Math.round(rankList.indexOf(rank) * 10) 
    }

    // calculate the score
    let score = Math.round((playtime / 10) + (achievements * 50) + (kills / 10) + (winRate * 10) + rankScore);

    return score;    
}


const createScore = asyncHandler( async (req, res) => {

    // Get the user_id
    const userId = req.user._id;
    
    // Get the game_id
    const { gameName } = req.params;

    // validation
    if(!userId){
        throw new ApiError (400, "No user_id received");
    }

    if(!gameName && gameName !== String){
        console.log(typeof gameName)
        throw new ApiError (400, "provide valid params");
    }

    const game = await Game.findOne({name: gameName, fetchedAgainst: userId});
    console.log(game)
    // const playtime = game.playtime_forever
    // const achievements = game.achievements_unlocked;
    const {playtime_forever, achievements_unlocked, total_kills, win_rate, rank} = game;
    // calculate the scoreValue
    const scoreValue = calculateScore(playtime_forever, achievements_unlocked, total_kills, win_rate, rank);

    if(!scoreValue){
        console.log(playtime_forever, achievements_unlocked)
        console.log(scoreValue)
        throw new ApiError(404, "error calculating scoreValue")
    }

    // Create the Score
    const score = await Score.create({
        scoredBy: userId,
        scoredIn: gameName,
        scoreValue: scoreValue
    })

    // add to the users accumulated score
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $inc: {accumulated_Score: scoreValue}
        }
    )

    // Response
    return res
    .status(201)
    .json(new ApiResponse(201, score, "Started playing a new Game"));

})

const getScores = asyncHandler(async (req, res) => {

    // Get the user_id
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "No user_id received");
    }

    // create an empty objct to store all the Score objects
    const userScores = {};

    // find the Score schema related to the user_id
    if(userId){
        userScores.scoredBy = userId;
    }
        
    // store them inside an object
    const scores = await Score.find(userScores).populate("scoredBy", "username")

    if(!userScores){
        throw new ApiError (400, "Failed to fetch the scores, please wait!")
    }

    // Response 
    return res
    .status(200)
    .json(new ApiResponse(201, scores, "Fetched all the the score successfully"))
})

export {
    createScore,
    getScores
}