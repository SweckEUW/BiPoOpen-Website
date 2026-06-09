import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentRegistration extends Document {
    teamName: string;
    player1: string;
    player2: string;
    teamLogo?: string;
}

const TournamentRegistrationSchema: Schema = new Schema(
    {
        teamName: { type: String, required: true, unique: true, index: true },
        player1: { type: String, required: true },
        player2: { type: String, required: true },
        teamLogo: { type: String, required: false },
    },
    { timestamps: true }
);

export default mongoose.model<ITournamentRegistration>('TournamentRegistration', TournamentRegistrationSchema, 'tournamentRegistration');
