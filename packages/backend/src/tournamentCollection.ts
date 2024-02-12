import {Collection, ObjectId} from "mongodb"
import {Request, Response} from "express";
import client from "./index"

export class tournamentCollection{

    static async getTournamentsCollection(): Promise<Collection<Document>>{
        return client.db('bipoopen').collection("tournaments")
    }

    // TOURNAMENT
    static async getTournaments(request: Request, response: Response){
        let collection = await tournamentCollection.getTournamentsCollection();
        let tournaments = await collection.find().toArray();
        
        if(tournaments)
            response.json({success: true, message: 'Tournaments gefunden', tournaments: tournaments});
        else    
            response.json({success: false, message: 'Keine Tournaments gefunden'}); 
    }

    static async getTournamentByName(request: Request, response: Response){
        let collection = await tournamentCollection.getTournamentsCollection();
        let tournaments = await collection.find().toArray();

        let tournamentName = request.body.tournamentName;
        let tournament = tournaments.find((tournament:any) => tournament.name == tournamentName);
        if(tournament)
            response.json({success: true, message: 'Tournament "' + tournamentName + '" gefunden', tournament: tournament});
        else    
            response.json({success: false, message: 'Keine Tournaments gefunden'}); 
    }

    static async createTournament(request: Request, response: Response) {
        let tournament = request.body;

        // DEBUG!!
        if(tournament.teams)
            for (let i = 0; i < tournament.teams.length; i++)
                tournament.teams[i]._id = new ObjectId().toString();      

        // Add tournament to collection
        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.insertOne(tournament);

        response.json({success: true, message: 'Tournament "' + tournament.name + '" erstellt'});
    }

    // SETTINGS

    static async setSettings(request: Request, response: Response) {
        let tournamentID = request.body.tournamentID;
        let settings = request.body.settings;
        
        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, {$set: {"settings": settings}});

        response.json({success: true, message: 'Einstellungen gesetzt'});
    }


    // TEAMS
    static async addTeam(request: Request, response: Response) {
        let team = request.body.team;
        team._id = new ObjectId().toString();   

        let tournamentID = request.body.tournamentID;

        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, {$push: {teams: team}});

        response.json({success: true, message:  'Team "' + team.name + '" hinzugefügt'});
    }

    static async editTeam(request: Request, response: Response) {
        let team = request.body.team;
        let tournamentID = request.body.tournamentID;

        // TODO: Replace complete team element instead of single team values
        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}, "teams._id": team._id }, { $set: { "teams.$.name": team.name, "teams.$.players": team.players } });
        
        response.json({success: true, message: 'Team "' + team.name + '" bearbeitet'});
    }

    static async removeTeam(request: Request, response: Response) {
        let tournamentID = request.body.tournamentID;
        let teamID = request.body.teamID;
        
        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, { $pull: { teams: { _id: teamID } } });

        response.json({success: true, message: 'Team gelöscht'});
    }

    // GROUPS
    static async setGroups(request: Request, response: Response) {
        let tournamentID = request.body.tournamentID;
        let groups = request.body.groups;
        
        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, {$set: {"groupPhase.groups": groups}});

        response.json({success: true, message: 'Gruppen gesetzt'});
    }

    static async setMatchesGroupPhase(request: Request, response: Response) {
        let tournamentID = request.body.tournamentID;
        let matches = request.body.matches;

        matches.forEach((matchesForGroup:any) => {
            matchesForGroup.forEach((match:any) => {
                match._id = new ObjectId().toString();    
            });
        });

        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, {$set: {"groupPhase.matches": matches}});

        response.json({success: true, message: 'Matches für Gruppenphase gesetzt'});
    }

    // KO-PHASE
    static async setMatchesKOPhase(request: Request, response: Response) {
        let tournamentID = request.body.tournamentID;
        let matches = request.body.matches;

        matches.forEach((stage:any) => {
            stage.forEach((match:any) => {
                match._id = new ObjectId().toString();    
            });
        });

        let collection = await tournamentCollection.getTournamentsCollection();
        await collection.updateOne({"_id": {$eq: ObjectId.createFromHexString(tournamentID)}}, {$set: {"koPhase.matches": matches}});

        response.json({success: true, message: 'Matches für KO-Phase gesetzt'});
    }

}