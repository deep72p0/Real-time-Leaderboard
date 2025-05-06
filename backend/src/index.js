import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 5001
connectDB()
.then(() => {
    app.listen(PORT || 5001, () => {
        console.log(`⚙️ Server is running at port : ${PORT}`)
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})