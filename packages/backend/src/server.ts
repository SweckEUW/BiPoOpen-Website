import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import tournamentRoutes from './routes/Tournament';
import openGameRoutes from './routes/OpenGame';
import leagueGameRoutes from './routes/LeagueGame';
import playerImageRoutes from './routes/PlayerImage';

const router = express();

// Cache the MongoDB connection for serverless (Vercel) warm invocations
let cached = (globalThis as any).__mongoose;
if (!cached) {
    cached = (globalThis as any).__mongoose = { conn: null, promise: null };
}

// Connect to Mongo (reuse cached connection if available)
if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongo.url, { retryWrites: true, w: 'majority', dbName: "bipoopen" });
}

cached.promise.then((conn: typeof mongoose) => {
    cached.conn = conn;
    console.log('MongoDB connected');
    StartServer();
}).catch((err: unknown) => { 
    cached.promise = null; // Reset so next invocation retries
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
    router.use(express.json({ limit: '5mb' }));

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
    router.use('/leagueGames', leagueGameRoutes);
    router.use('/playerImages', playerImageRoutes);

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