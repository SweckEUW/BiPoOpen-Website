import mongoose, { InferSchemaType, Schema } from 'mongoose';

export type ILeagueCupModel = InferSchemaType<typeof LeagueCupSchema>;

const ParticipantSchema = new Schema(
  {
    teamName: { type: String, required: true },
    league: { type: Number, required: true } // Liga, aus der das Team kommt: 1 | 2
  },
  { _id: false }
);

const PairingSchema = new Schema(
  {
    team1: { type: String, required: true }, // Teamname
    team2: { type: String, required: true }
  },
  { _id: false }
);

// Die Begegnungen jeder Runde werden einzeln vom Admin festgelegt, es gibt keinen festen Turnierbaum.
// Die Ergebnisse liegen als LeagueGame mit cupId + cupRound in der leagueGames-Collection.
const RoundSchema = new Schema(
  {
    name: { type: String, required: true }, // "1. Runde", "2. Runde", "Viertelfinale", ...
    bestOf: { type: Number, required: true, default: 1 },
    createdTime: { type: Number, required: true },
    pairings: { type: [PairingSchema], default: [] },
    byes: { type: [String], default: [] } // Teams mit Freilos
  },
  { _id: false }
);

const LeagueCupSchema = new Schema(
  {
    season: { type: String, required: true }, // z.B. "2026-27"
    name: { type: String, required: true, default: 'BiPo League Cup' },
    participants: { type: [ParticipantSchema], default: [] },
    rounds: { type: [RoundSchema], default: [] }
  },
  { versionKey: false }
);

export default mongoose.model<ILeagueCupModel>('LeagueCup', LeagueCupSchema, 'leagueCups');
