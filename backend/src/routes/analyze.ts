import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { analyzeWithAI } from '../services/aiService';
import { calculateRepairCost } from '../services/pricingEngine';

export const analyzeRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `damage_${uniqueId}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    },
});

// POST /api/analyze - Upload and analyze damage image
analyzeRouter.post('/', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided',
            });
        }

        const imagePath = req.file.path;
        const imageUrl = `/uploads/${req.file.filename}`;

        console.log(`📸 Received image: ${req.file.filename}`);

        // Send to AI server for analysis
        const aiResult = await analyzeWithAI(imagePath);

        // Calculate repair cost using pricing engine
        const costEstimate = calculateRepairCost({
            partDetected: aiResult.partDetected,
            damageType: aiResult.damageType,
            severityScore: aiResult.severityScore,
            location: req.body.location || 'default',
        });

        // Combine results
        const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';
        const result = {
            success: true,
            analysisId: uuidv4(),
            timestamp: new Date().toISOString(),
            imageUrl,
            annotatedImageUrl: aiResult.annotatedImageUrl
                ? `${AI_SERVER_URL}${aiResult.annotatedImageUrl}`
                : null,
            heatmapUrl: aiResult.heatmapUrl
                ? `${AI_SERVER_URL}${aiResult.heatmapUrl}`
                : null,
            detection: {
                partDetected: aiResult.partDetected,
                damageType: aiResult.damageType,
                severityScore: aiResult.severityScore,
                confidenceScore: aiResult.confidenceScore,
                boundingBox: aiResult.boundingBox,
            },
            estimate: {
                partsCost: costEstimate.partsCost,
                laborCost: costEstimate.laborCost,
                totalCost: costEstimate.totalCost,
                locationMultiplier: costEstimate.locationMultiplier,
                breakdown: costEstimate.breakdown,
            },
        };

        console.log(`✅ Analysis complete: ${aiResult.partDetected} - ${aiResult.damageType}`);

        res.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Analysis failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/analyze/:id - Get analysis result by ID (placeholder for DB integration)
analyzeRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Fetch from database when implemented
    res.status(501).json({
        success: false,
        error: 'Not implemented',
        message: 'Database integration pending',
    });
});
