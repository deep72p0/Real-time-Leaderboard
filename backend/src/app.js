import e from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();

app.use(cors({
    origin:process.env.CORS_ORIGIN, //frontend URL
    credentials: true, // required for cookies/sessions 
    allowedHeaders: ["Content-Type", "Authorization"], // allow headers for authentiction
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] // allows HTTP methods
}))

app.use(e.json({limit: "16kb"}))
app.use(e.urlencoded({extended: true, limit: "16kb"}))
app.use(e.static("public"))
app.use(cookieParser())

// routes import
import userRouter from "./routes/user.routes.js"
import scoreRouter from "./routes/score.routes.js"
import gameRouter from "./routes/game.routes.js"
import leaderboardRouter from "./routes/leaderboard.routes.js"

// routes declaration
app.use("/api/l1/users", userRouter)
app.use("/api/l1/scores", scoreRouter)
app.use("/api/l1/games", gameRouter)
app.use("/api/l1/leaderboard", leaderboardRouter)

export { app }