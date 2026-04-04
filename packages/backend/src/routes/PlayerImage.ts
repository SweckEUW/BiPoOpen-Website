import express from 'express';
import controller from '../controllers/PlayerImage';

const router = express.Router();

router.post('/upload', controller.upsertPlayerImage);
router.get('/get/:playerName', controller.getPlayerImage);
router.delete('/delete/:playerName', controller.deletePlayerImage);

export = router;
