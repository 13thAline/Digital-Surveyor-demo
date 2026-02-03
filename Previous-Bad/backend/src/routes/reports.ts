import { Router, Request, Response } from 'express';
import { generatePDFReport } from '../services/pdfGenerator';
import { v4 as uuidv4 } from 'uuid';

export const reportsRouter = Router();

// POST /api/reports/generate - Generate PDF report
reportsRouter.post('/generate', async (req: Request, res: Response) => {
    try {
        const {
            analysisId,
            customerName,
            vehicleInfo,
            detection,
            estimate,
            imageUrl,
            annotatedImageUrl,
            heatmapUrl,
        } = req.body;

        if (!detection || !estimate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: detection and estimate',
            });
        }

        const reportId = uuidv4();
        const reportData = {
            reportId,
            analysisId: analysisId || uuidv4(),
            generatedAt: new Date().toISOString(),
            customerName: customerName || 'Customer',
            vehicleInfo: vehicleInfo || {},
            detection,
            estimate,
            imageUrl,
            annotatedImageUrl,
            heatmapUrl,
        };

        const pdfPath = await generatePDFReport(reportData);
        const pdfUrl = `/reports/${reportId}.pdf`;

        res.json({
            success: true,
            reportId,
            pdfUrl,
            pdfPath,
        });
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// GET /api/reports/:id - Download report PDF
reportsRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const pdfPath = `./reports/${id}.pdf`;

    res.download(pdfPath, `damage_report_${id}.pdf`, (err) => {
        if (err) {
            res.status(404).json({
                success: false,
                error: 'Report not found',
            });
        }
    });
});
