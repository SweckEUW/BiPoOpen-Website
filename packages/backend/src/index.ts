import express, { Express, Response, Request } from "express";

import cors from "cors";
import {MongoClient, ServerApiVersion} from "mongodb"
import * as dotenv from "dotenv";

import {tournamentCollection} from "./tournamentCollection"

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORT}@cluster0.wpwuaak.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect()
.catch(error => { 
  console.error(error);
  process.exit(1);
}).then(async client =>{
  console.log("Connected to Database")

  await tournamentCollection.retrieveTournamentsCollection(client);

  app.listen(process.env.PORT, () =>{
    console.log('Server started')
  });
})

app.get("/", (request: Request, response: Response) => {
  response.send("BiPo Open Backend"); 
})

// Tournament
app.get('/tournaments', tournamentCollection.getTournaments);
app.post('/getTournamentByName', tournamentCollection.getTournamentByName);
app.post('/createTournament', tournamentCollection.createTournament);

// Team
app.post('/addTeam', tournamentCollection.addTeam);
app.post('/editTeam', tournamentCollection.editTeam);
app.post('/removeTeam', tournamentCollection.removeTeam);

// Group Stage
app.post('/setGroups', tournamentCollection.setGroups);

// Group Stage - Settings
app.post('/setSettings', tournamentCollection.setSettings);

// K.o Stage
app.post('/setMatchesGroupPhase', tournamentCollection.setMatchesGroupPhase);
app.post('/setMatchesKOPhase', tournamentCollection.setMatchesKOPhase);


// let filename = fileURLToPath(import.meta.url);
// let dirname = path.dirname(filename);
// app.use(express.static(path.join(dirname, 'public')));

export default app;