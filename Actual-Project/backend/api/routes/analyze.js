import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma.js';
import { optionalAuth } from '../middleware/auth.js';
import { calculateRepairCost } from '../services/pricingService.js';
const router = express.Router();

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
});

/**
 * POST /api/analyze
 * Analyze vehicle damage - proxies to AI server and enriches with cost estimate
 */
router.post('/', optionalAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
    }

    try {
        // Get user's city for pricing (from auth or request body)
        const city = req.user?.city || req.body?.city || 'default';

        // Create form data to send to AI server
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Forward to AI server
        console.log(`Forwarding image to AI server: ${AI_SERVER_URL}/analyze`);

        const aiResponse = await axios.post(`${AI_SERVER_URL}/analyze`, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000 // 2 minute timeout for AI processing
        });

        const aiData = aiResponse.data;
        console.log('AI server response:', JSON.stringify(aiData, null, 2));

        // Calculate repair costs using our pricing algorithm
        const costEstimate = await calculateRepairCost(aiData.detections || [], city);

        // Build response URLs (point to AI server for static files)
        const annotatedImageUrl = aiData.annotatedImageUrl
            ? `${AI_SERVER_URL}${aiData.annotatedImageUrl}`
            : null;
        const heatmapUrl = aiData.heatmapUrl
            ? `${AI_SERVER_URL}${aiData.heatmapUrl}`
            : null;

        // Optionally save report to database
        let reportId = null;
        if (aiData.detections && aiData.detections.length > 0) {
            try {
                const report = await prisma.report.create({
                    data: {
                        costMin: costEstimate.total.min,
                        costMax: costEstimate.total.max,
                        userId: req.user?.id || null,
                        damages: {
                            create: aiData.detections.map(d => ({
                                part: d.partDetected || 'Unknown',
                                damageType: d.damageType || 'Unknown',
                                severityScore: d.severityScore || 0,
                                depthEstimate: d.depthEstimate || null
                            }))
                        },
                        images: {
                            create: [{
                                url: `/uploads/${req.file.filename}`
                            }]
                        }
                    }
                });
                reportId = report.id;
            } catch (dbError) {
                console.error('Error saving report to database:', dbError);
                // Continue without saving - this shouldn't fail the request
            }
        }

        // Clean up uploaded file after forwarding
        // Keep it for now as we reference it in the report
        // fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            reportId,
            detections: aiData.detections || [],
            annotatedImageUrl,
            heatmapUrl,
            costEstimate,
            city: city
        });

    } catch (error) {
        console.error('Analysis error:', error.message);

        // Clean up uploaded file on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'AI server is not available. Please try again later.'
            });
        }

        if (error.response) {
            return res.status(error.response.status).json({
                error: error.response.data?.detail || 'AI analysis failed.'
            });
        }

        res.status(500).json({ error: 'Failed to analyze image.' });
    }
});

/**
 * GET /api/analyze/labor-costs/:city
 * Get labor cost for a specific city
 */
router.get('/labor-costs/:city', async (req, res) => {
    try {
        const { city } = req.params;

        const laborCost = await prisma.laborCost.findFirst({
            where: {
                city: {
                    equals: city,
                    mode: 'insensitive'
                }
            }
        });

        if (laborCost) {
            res.json(laborCost);
        } else {
            res.json({
                city: city,
                hourlyRate: 350, // Default tier2 rate
                tier: 'tier2',
                message: 'City not found, using default rate'
            });
        }
    } catch (error) {
        console.error('Error fetching labor cost:', error);
        res.status(500).json({ error: 'Failed to fetch labor cost.' });
    }
});

/**
 * GET /api/analyze/labor-costs
 * Get all labor costs
 */
router.get('/labor-costs', async (req, res) => {
    try {
        const laborCosts = await prisma.laborCost.findMany({
            orderBy: { city: 'asc' }
        });
        res.json(laborCosts);
    } catch (error) {
        console.error('Error fetching labor costs:', error);
        res.status(500).json({ error: 'Failed to fetch labor costs.' });
    }
});

export default router;
