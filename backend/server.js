import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'GigCover Backend is running.' });
});

// AI Risk Assessment Endpoint
app.post('/api/risk-assessment', async (req, res) => {
    const { name, city, platform, dailyIncome, zoneType } = req.body;

    // Basic validation
    if (!name || !city || !platform || !dailyIncome || !zoneType) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Call Python AI service endpoint
        const aiResponse = await axios.post('http://localhost:8000/predict-risk', {
            name,
            city,
            platform,
            dailyIncome,
            zoneType
        });

        // Receive risk score, weekly premium, and coverage amount
        const { riskScore, weeklyPremium, coverageAmount } = aiResponse.data;

        // Return response to frontend
        return res.json({
            riskScore,
            weeklyPremium,
            coverageAmount
        });
    } catch (error) {
        console.error('Error calling AI service:', error.message);
        return res.status(500).json({ error: 'Failed to process risk assessment' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
