import mongoose, { Document, Schema } from 'mongoose';

export interface IOpenGameModel extends Document {}

const PlayerSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    score: { type: Number, required: true }
  },
  { _id: false }
);

const TeamSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String },
    players: { type: [PlayerSchema], required: true }
  },
  { _id: false }
);

// TurnSchema
const TurnSchema = new Schema(
  {
    playerIndex: { type: Number, required: true },
    teamIndex: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        'hit',
        'miss',
        'airball',
        'bomb',
        'bouncer',
        'trickshot',
        'onfire',
        'ballsback',
        'lastCup'
      ],
      required: true
    },
    data: { type: Schema.Types.Mixed, required: true }, // flexibel für alle Turn-Datenstrukturen
    time: { type: Number, required: true }
  },
  { _id: false }
);

const MatchSchema = new Schema(
  {
    team1: { type: TeamSchema, required: true },
    team2: { type: TeamSchema, required: true },
    time: { type: Number },
    endTime: { type: Number },
    turns: { type: [TurnSchema], default: [] }
  },
  { versionKey: false }
);

export default mongoose.model<IOpenGameModel>('OpenGame', MatchSchema, 'openGames');