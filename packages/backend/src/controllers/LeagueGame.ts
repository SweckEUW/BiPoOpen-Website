import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import LeagueGame from "../models/LeagueGame";

const createLeagueGame = (req: Request, res: Response, next: NextFunction) => {
    const { team1, team2, time, turns, endTime } = req.body;

    const leagueGame = new LeagueGame({
        _id: new mongoose.Types.ObjectId(),
        team1,
        team2,
        time,
        endTime,
        turns: turns || [] // Falls noch keine Runden vorhanden sind
    });

    leagueGame
        .save()
        .then((leagueGame) => res.status(201).json({ leagueGame }))
        .catch((error) => res.status(500).json({ error }));
};

const readLeagueGame = (req: Request, res: Response, next: NextFunction) => {
    const leagueGameID = req.params.leagueGameID;

    LeagueGame.findOne({ _id: leagueGameID })
        .then((leagueGame) => {
            if (leagueGame) {
                res.status(200).json({ leagueGame });
            } else {
                res.status(404).json({ message: "League Game not found" });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    LeagueGame.find()
        .then((leagueGames) => {
            res.status(200).json({ leagueGames });
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const updateLeagueGame = (req: Request, res: Response, next: NextFunction) => {
    const leagueGameId = req.params.leagueGameId;
    
    LeagueGame.findById(leagueGameId)
        .then((leagueGame) => {
            if (leagueGame) {
                leagueGame.set(req.body);

                leagueGame
                    .save()
                    .then((leagueGame) => res.status(201).json({ leagueGame }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteLeagueGame = (req: Request, res: Response, next: NextFunction) => {
    const leagueGameID = req.params.leagueGameID;

    LeagueGame.findByIdAndDelete(leagueGameID)
        .then((leagueGame) => {
            if (leagueGame) {
                res.status(200).json({ message: "League Game deleted" });
            } else {
                res.status(404).json({ message: "League Game not found" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ error });
        });
};

export default { createLeagueGame, readLeagueGame, readAll, updateLeagueGame, deleteLeagueGame };