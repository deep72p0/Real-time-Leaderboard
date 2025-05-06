import mongoose, {Schema} from "mongoose";

const scoreSchema = new Schema(
    {
        scoredBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        scoredIn: {
            type: String, 
        },
        scoreValue: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

export const Score = mongoose.model("Score", scoreSchema)