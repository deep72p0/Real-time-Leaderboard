import mongoose, { Schema } from "mongoose";

const gameSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        fetchedAgainst: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        playtime_forever: {
            type: Number,
            required: true
        },
        achievements_unlocked: {
            type: Number,
            required: true
        },
        total_kills: {
            type: Number
        },
        win_rate: {
            type: Number,
            required: true
        },
        rank: {
            type: String,
            required: true
        },
        last_played: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Game = mongoose.model("Game", gameSchema)