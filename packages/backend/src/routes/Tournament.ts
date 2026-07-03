import express from "express";
import controller from "../controllers/Tournament";

const router = express.Router();

// Tournament
router.post("/create", controller.createTournament);
router.get("/get/:tournamentName", controller.readTournament);
router.get("/get", controller.readAll);
router.patch("/update/:tournamentId", controller.updateTournament);
router.delete("/delete/:tournamentId", controller.deleteTournament);

// Settings
// router.post('/setSettings', controller.setSettings);

// Teams
router.post("/addTeam/:tournamentId", controller.addTeam);
router.post("/editTeam/:tournamentId", controller.editTeam);
router.post("/removeTeam/:tournamentId", controller.removeTeam);

// Group Stage
router.post('/setGroups', controller.setGroups);

// K.o Stage
router.post('/setMatchesGroupPhase', controller.setMatchesGroupPhase);
router.post('/setMatchesKOPhase', controller.setMatchesKOPhase);

export = router;