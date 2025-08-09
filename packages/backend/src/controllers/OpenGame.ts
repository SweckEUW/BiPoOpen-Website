import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import OpenGame from "../models/OpenGame";

const createOpenGame = (req: Request, res: Response, next: NextFunction) => {
    const { team1, team2, time, turns } = req.body;

    const openGame = new OpenGame({
        _id: new mongoose.Types.ObjectId(),
        team1,
        team2,
        time,
        turns: turns || [] // Falls noch keine Runden vorhanden sind
    });

    openGame
        .save()
        .then((openGame) => res.status(201).json({ openGame }))
        .catch((error) => res.status(500).json({ error }));
};

const readOpenGame = (req: Request, res: Response, next: NextFunction) => {
    const openGameID = req.params.openGameID;

    OpenGame.findOne({ _id: openGameID })
        .then((openGame) => {
            if (openGame) {
                res.status(200).json({ openGame });
            } else {
                res.status(404).json({ message: "Open Game not found" });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    OpenGame.find()
        .then((openGames) => {
            res.status(200).json({ openGames });
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const updateOpenGame = (req: Request, res: Response, next: NextFunction) => {
    const openGameId = req.params.openGameId;
    
    OpenGame.findById(openGameId)
        .then((openGame) => {
            if (openGame) {
                openGame.set(req.body);

                openGame
                    .save()
                    .then((openGame) => res.status(201).json({ openGame }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteOpenGame = (req: Request, res: Response, next: NextFunction) => {
    const openGameID = req.params.openGameID;

    OpenGame.findByIdAndDelete(openGameID)
        .then((openGame) => {
            if (openGame) {
                res.status(200).json({ message: "Open Game deleted" });
            } else {
                res.status(404).json({ message: "Open Game not found" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ error });
        });
};

export default { createOpenGame, readOpenGame, readAll, updateOpenGame, deleteOpenGame };