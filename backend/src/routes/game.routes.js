import { Router } from "express";
import {
    createGame
} from "../controllers/game.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createGame);

export default router;