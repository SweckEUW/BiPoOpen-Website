import mongoose, { Document, Schema } from 'mongoose';

export interface IOpenGameModel extends Document {}

const OpenGameSchema = new Schema(
    {
        team1: {
            type: {
                players: [
                    {
                        name: { type: String, required: true },
                        score: { type: Number, required: true }
                    }
                ]
            },
        },
        team2: {
            type: {
                players: [
                    {
                        name: { type: String, required: true },
                        score: { type: Number, required: true }
                    }
                ]
            },
        },
        time: { type: Number, required: true }
    }, 
    {
        versionKey: false
    }
);

export default mongoose.model('OpenGame', OpenGameSchema, "openGames");