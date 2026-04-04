import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayerImage extends Document {
    playerName: string;
    imageData: string;
}

const PlayerImageSchema: Schema = new Schema(
    {
        playerName: { type: String, required: true, unique: true, index: true },
        imageData: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IPlayerImage>('PlayerImage', PlayerImageSchema);
