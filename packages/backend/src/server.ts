import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import tournamentRoutes from './routes/Tournament';
import openGameRoutes from './routes/OpenGame';

const router = express();

// Connect to Mongo
mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority', dbName: "bipoopen"}).then(() => {
    console.log('MongoDB connected');
    StartServer();
}).catch((err) => {
    console.log('MongoDB connection error:', err);
});

// Only start the server if Mongo connects
const StartServer = () => {
    router.use((req, res, next) => {
        console.log(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the res */
            console.log(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    /** Rules of our API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            res.status(200).json({});
            return;
        }

        next();
    });

    // Routes
    router.use('/tournaments', tournamentRoutes);
    router.use('/openGames', openGameRoutes);

    // Error handling
    router.use((req, res, next) => {
        const error = new Error('Not found');

        console.error(error);

        res.status(404).json({
            message: error.message
        });
    });

    router.listen(config.server.port, () =>{
        console.info(`Server is running on port ${config.server.port}`)
    });
}