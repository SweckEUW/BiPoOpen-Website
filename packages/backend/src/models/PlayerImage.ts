import mongoose, { InferSchemaType, Schema } from 'mongoose';

export type IPlayerImage = InferSchemaType<typeof PlayerImageSchema>;

const PlayerImageSchema: Schema = new Schema(
    {
        playerName: { type: String, required: true, unique: true, index: true },
        imageData: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IPlayerImage>('PlayerImage', PlayerImageSchema);
