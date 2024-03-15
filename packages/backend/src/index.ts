import express from "express";
import cors from "cors";
import {MongoClient, ServerApiVersion} from "mongodb"
import { config as DotEnvConfig } from "dotenv";
import {tournamentCollection} from "./tournamentCollection"

DotEnvConfig();

const app = express();
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

client.connect().catch(error => { 
  console.error(error);
  process.exit(1);
}).then(() =>{
  console.log("Connected to Database")

  app.listen(8000, () =>{
    console.log('Server started')
  });
})

app.get("/", (request, response) => {
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

export default client;