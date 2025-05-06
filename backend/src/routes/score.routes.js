import { Router } from "express";
import {
    createScore,
    getScores
} from "../controllers/score.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getScores);
router.route("/:gameName").post(createScore);

export default router;