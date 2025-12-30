import express from "express";
import controller from "../controllers/LeagueGame";

const router = express.Router();

router.post("/create", controller.createLeagueGame);
router.get("/get", controller.readAll);
router.patch("/update/:leagueGameId", controller.updateLeagueGame);

export = router;