import mongoose, { Schema } from "mongoose";
import { Game } from "../models/game.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createGame = asyncHandler(async (req, res) => {

    // get the user_id
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "userId is not found")
    }
    // get the data (Here im passing the data manually, ideally we need to fetch                                                                             
    const { 
        name, 
        playtime, 
        achievements, 
        kills, 
        winRate,
        rank,
        lastPlayed } = req.body;  // all the games(linked by our platform to the user) data via some methodand pass it here)

    // validation
    if(!name || !playtime || !achievements || !kills || !winRate || !rank || !lastPlayed){
        throw new ApiError(400, "some data is missing");
    }

    // create game
    const game = await Game.create({
        name: name,
        fetchedAgainst: userId,
        playtime_forever: playtime,
        achievements_unlocked: achievements,
        total_kills: kills,
        win_rate: winRate,
        rank: rank,
        last_played: lastPlayed
    })

    if(!game){
        throw new ApiError(400, "failed to registere the game")
    }

    // Response
    return res
    .status(201)
    .json(new ApiResponse(201, game, "started playing a new game"));
})

export {
    createGame
}