import express from "express";
import controller from "../controllers/OpenGame";

const router = express.Router();

router.post("/create", controller.createOpenGame);
// router.get("/get/:tournamentName", controller.readOpenGame);
router.get("/get", controller.readAll);
router.patch("/update/:openGameId", controller.updateOpenGame);
// router.delete("/delete/:tournamentId", controller.deleteOpenGame);

export = router;