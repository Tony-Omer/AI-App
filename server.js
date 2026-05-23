import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import path from 'path';
import pool from 'pg';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Strategy as LocalStrategy } from 'passport-local';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;







const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret_key',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());






// main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// API endpoint to handle search requests from the frontend

app.post('/api/search', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        // Call the Gemini API to get a response based on the user's query
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: query,
        });

        // Send the plain text response back to the client
        res.json({ text: response.text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to fetch response from Gemini." });
    }
});










app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});