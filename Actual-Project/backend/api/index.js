import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from "./routes/auth.js";
import analyzeRoutes from "./routes/analyze.js";
import reportsRoutes from "./routes/reports.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/reports", reportsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        name: "Digital Surveyor Backend API",
        version: "1.0.0",
        endpoints: {
            auth: {
                signup: "POST /auth/signup",
                login: "POST /auth/login",
                me: "GET /auth/me",
                updateProfile: "PUT /auth/profile"
            },
            analyze: {
                analyzeImage: "POST /api/analyze",
                laborCosts: "GET /api/analyze/labor-costs",
                laborCostByCity: "GET /api/analyze/labor-costs/:city"
            },
            reports: {
                generatePDF: "POST /api/reports/generate",
                getReport: "GET /api/reports/:id"
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Digital Surveyor Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
    console.log(`🔍 Analyze endpoint: http://localhost:${PORT}/api/analyze`);
    console.log(`📄 Reports endpoint: http://localhost:${PORT}/api/reports`);
});
