import mongoose, { InferSchemaType, Schema } from 'mongoose';

export type ITournamentRegistration = InferSchemaType<typeof TournamentRegistrationSchema>;

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
