
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import routes from './routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(cookieParser());

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/api', (req: Request, res: Response) => {
    res.send('Volleyball Club Manager API is running!');
});
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
