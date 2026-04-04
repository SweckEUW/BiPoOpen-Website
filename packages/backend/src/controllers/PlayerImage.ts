import { Request, Response, NextFunction } from 'express';
import PlayerImage from '../models/PlayerImage';

const IMAGE_DATA_PATTERN = /^data:image\/(png|jpeg|webp|jpg);base64,/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB in characters (base64)

const upsertPlayerImage = (req: Request, res: Response, next: NextFunction) => {
    const { playerName, imageData } = req.body;

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        res.status(400).json({ message: 'playerName is required' });
        return;
    }

    if (!imageData || typeof imageData !== 'string') {
        res.status(400).json({ message: 'imageData is required' });
        return;
    }

    if (!IMAGE_DATA_PATTERN.test(imageData)) {
        res.status(400).json({ message: 'imageData must be a valid base64 image (png, jpeg, or webp)' });
        return;
    }

    if (imageData.length > MAX_IMAGE_SIZE) {
        res.status(400).json({ message: 'Image too large. Maximum size is ~2MB.' });
        return;
    }

    PlayerImage.findOneAndUpdate(
        { playerName: playerName.trim() },
        { playerName: playerName.trim(), imageData },
        { upsert: true, new: true, runValidators: true }
    )
        .then((playerImage) => res.status(200).json({ playerName: playerImage.playerName }))
        .catch((error) => res.status(500).json({ error }));
};

const getPlayerImage = (req: Request, res: Response, next: NextFunction) => {
    const { playerName } = req.params;

    if (!playerName) {
        res.status(400).json({ message: 'playerName parameter is required' });
        return;
    }

    PlayerImage.findOne({ playerName: decodeURIComponent(playerName) })
        .then((playerImage) => {
            if (!playerImage) {
                res.status(200).json({ playerName: decodeURIComponent(playerName), imageData: null });
                return;
            }
            res.status(200).json({ playerName: playerImage.playerName, imageData: playerImage.imageData });
        })
        .catch((error) => res.status(500).json({ error }));
};

const deletePlayerImage = (req: Request, res: Response, next: NextFunction) => {
    const { playerName } = req.params;

    if (!playerName) {
        res.status(400).json({ message: 'playerName parameter is required' });
        return;
    }

    PlayerImage.findOneAndDelete({ playerName: decodeURIComponent(playerName) })
        .then((playerImage) => {
            if (!playerImage) {
                res.status(404).json({ message: 'No image found for this player' });
                return;
            }
            res.status(200).json({ message: 'Image deleted', playerName: playerImage.playerName });
        })
        .catch((error) => res.status(500).json({ error }));
};

export default { upsertPlayerImage, getPlayerImage, deletePlayerImage };
