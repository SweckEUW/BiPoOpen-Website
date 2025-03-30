import express from "express";
import controller from "../controllers/Tournament";

const router = express.Router();

router.post("/create", controller.createTournament);
router.get("/get/:tournamentName", controller.readTournament);
router.get("/get", controller.readAll);
router.patch("/update/:tournamentId", controller.updateTournament);
router.delete("/delete/:tournamentId", controller.deleteTournament);

export = router;