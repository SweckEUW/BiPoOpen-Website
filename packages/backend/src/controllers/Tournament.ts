import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Tournament from "../models/Tournament";
import { tournamentAggregation } from "./TournamentAggregate";

const createTournament = (req: Request, res: Response, next: NextFunction) => {
    // const { name } = req.body;

    let name = "Test AAAA";

    const tournament = new Tournament({
        _id: new mongoose.Types.ObjectId(),
        name: name,
    });

    tournament
        .save()
        .then((tournament) => { res.status(201).json({ tournament })})
        .catch((error) => { res.status(500).json({ error });});
};

const readTournament = (req: Request, res: Response, next: NextFunction) => {
    let tournamentName = req.params.tournamentName;
    tournamentName = tournamentName.replaceAll("-", " ");

    Tournament.aggregate(tournamentAggregation()).then((tournaments) => {
        const tournament = tournaments.find((tournament) => tournament.name === tournamentName);
        if (tournament) {
            res.status(200).json({ tournament });
        }
    });
    
    // Tournament.findOne({ name: tournamentName })
        
    //     .then((tournament) => {
    //         if (tournament) {
    //             res.status(200).json({ tournament });
    //         } else {
    //             res.status(404).json({ message: "Tournament not found" });
    //         }
    //     })
    //     .catch((error) => {
    //         res.status(500).json({ error });
    //     });
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    Tournament.find()
        .then((tournaments) => {
            res.status(200).json({ tournaments });
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const updateTournament = (req: Request, res: Response, next: NextFunction) => {
    const tournamentId = req.params.tournamentId;

    Tournament.findById(tournamentId)
        .then((tournament) => {
            if (tournament) {
                tournament.set(req.body);

                tournament
                    .save()
                    .then((tournament) => res.status(201).json({ tournament }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteTournament = (req: Request, res: Response, next: NextFunction) => {
    const tournamentId = req.params.tournamentId;

    Tournament.findByIdAndDelete(tournamentId)
        .then((tournament) => {
            if (tournament) {
                res.status(200).json({ message: "Tournament deleted" });
            } else {
                res.status(404).json({ message: "Tournament not found" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ error });
        });
};

export default { createTournament, readTournament, readAll, updateTournament, deleteTournament };