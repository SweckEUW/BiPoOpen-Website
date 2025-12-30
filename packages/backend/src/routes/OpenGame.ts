import express from "express";
import controller from "../controllers/OpenGame";

const router = express.Router();

router.post("/create", controller.createOpenGame);
router.get("/get", controller.readAll);
router.patch("/update/:openGameId", controller.updateOpenGame);

export = router;