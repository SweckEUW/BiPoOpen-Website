import express from 'express';
import controller from '../controllers/TournamentRegistration';

const router = express.Router();

router.post('/register', controller.createRegistration);
router.get('/get', controller.getAllRegistrations);

export = router;
