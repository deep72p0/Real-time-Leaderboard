import { Router } from "express"; 
import {
    getLeaderboard
} from "../controllers/leaderboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getLeaderboard);

export default router;