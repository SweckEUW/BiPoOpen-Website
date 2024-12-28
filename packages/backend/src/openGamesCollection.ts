import { Collection } from "mongodb"
import {Request, Response} from "express";
import client from "./index"

export class openGamesCollection{

    static async getOpenGamesCollection(): Promise<Collection<Document>>{
        return client.db('bipoopen').collection("openGames")
    }

    static async getOpenGames(request: Request, response: Response){
        let collection = await openGamesCollection.getOpenGamesCollection();
        let openGames = await collection.find().toArray();
        
        if(openGames)
            response.json({success: true, message: 'Open Games gefunden', openGames: openGames});
        else    
            response.json({success: false, message: 'Keine Open Games gefunden'}); 
    }

    static async addOpenGame(request: Request, response: Response) {
        let openGame = request.body;

        let collection = await openGamesCollection.getOpenGamesCollection();
        await collection.insertOne(openGame);

        response.json({success: true, message: 'Open Game erstellt'});
    }

}