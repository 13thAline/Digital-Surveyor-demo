import express from 'express';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';
import { optionalAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Helper to download image from URL to buffer
 */
async function downloadImage(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Failed to download image:', url, error.message);
        return null;
    }
}

function formatINR(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Get severity label and color
 */
function getSeverityInfo(score) {
    if (score > 50) return { label: 'Replace', color: '#EF4444' };
    if (score >= 20) return { label: 'May be repairable', color: '#F59E0B' };
    return { label: 'Repairable (repaint)', color: '#10B981' };
}

/**
 * GET /api/reports
 * Get all reports for the authenticated user
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        // If user is authenticated, fetch their reports from the database
        if (req.user) {
            const reports = await prisma.report.findMany({
                where: { userId: req.user.id },
                include: {
                    damages: true,
                    images: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.json({
                success: true,
                reports: reports.map(report => ({
                    id: report.id,
                    createdAt: report.createdAt,
                    costMin: report.costMin,
                    costMax: report.costMax,
                    pdfUrl: report.pdfUrl,
                    damages: report.damages,
                    images: report.images.map(img => img.url)
                }))
            });
        }

        // For unauthenticated users, return empty (they use local storage)
        res.json({ success: true, reports: [] });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

/**
 * POST /api/reports/generate
 * Generate PDF report with images, user details, and pricing
 */
router.post('/generate', optionalAuth, async (req, res) => {
    try {
        const {
            detections = [],
            annotatedImageUrl,
            heatmapUrl,
            costEstimate,
            userDetails,
            reportId
        } = req.body;

        // Get user details from auth or request body
        const user = req.user ? await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { name: true, email: true, phone: true, city: true, state: true, address: true }
        }) : userDetails;

        const fileName = `report_${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        // Create PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Vehicle Damage Assessment Report',
                Author: 'Digital Surveyor',
                Subject: 'Damage Assessment',
                Keywords: 'vehicle, damage, assessment, repair'
            }
        });

        // Pipe to file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);


        doc.fontSize(24)
            .fillColor('#1E40AF')
            .text('Vehicle Damage Assessment Report', { align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(10)
            .fillColor('#6B7280')
            .text(`Generated on ${new Date().toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short'
            })}`, { align: 'center' });

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
        doc.moveDown(1);

        // ========================================
        // CUSTOMER DETAILS
        // ========================================
        if (user) {
            doc.fontSize(14)
                .fillColor('#111827')
                .text('Customer Details', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(11).fillColor('#374151');
            if (user.name) doc.text(`Name: ${user.name}`);
            if (user.email) doc.text(`Email: ${user.email}`);
            if (user.phone) doc.text(`Phone: ${user.phone}`);
            if (user.city || user.state) doc.text(`Location: ${user.city || ''}${user.city && user.state ? ', ' : ''}${user.state || ''}`);
            if (user.address) doc.text(`Address: ${user.address}`);

            doc.moveDown(1);
        }

        // ========================================
        // COST SUMMARY
        // ========================================
        doc.fontSize(14)
            .fillColor('#111827')
            .text('Estimated Repair Cost', { underline: true });
        doc.moveDown(0.5);

        if (costEstimate && costEstimate.total) {
            // Main cost box
            const boxY = doc.y;
            doc.rect(50, boxY, 495, 70)
                .fill('#F0FDF4');

            doc.fontSize(24)
                .fillColor('#166534')
                .text(`${formatINR(costEstimate.total.min)} - ${formatINR(costEstimate.total.max)}`,
                    50, boxY + 15, { align: 'center', width: 495 });

            doc.fontSize(10)
                .fillColor('#6B7280')
                .text('Total Estimated Cost (Parts + Labor)', 50, boxY + 48, { align: 'center', width: 495 });

            doc.y = boxY + 80;
            doc.moveDown(0.5);

            // Cost breakdown table
            doc.fontSize(11).fillColor('#374151');
            const breakdownY = doc.y;

            // Parts row
            doc.text('Replacement Parts:', 60, breakdownY);
            doc.text(`${formatINR(costEstimate.parts?.min || 0)} - ${formatINR(costEstimate.parts?.max || 0)}`,
                350, breakdownY, { width: 180, align: 'right' });

            // Labor row
            doc.text('Labor Cost:', 60, breakdownY + 18);
            doc.text(`${formatINR(costEstimate.labor?.min || 0)} - ${formatINR(costEstimate.labor?.max || 0)}`,
                350, breakdownY + 18, { width: 180, align: 'right' });

            // Labor rate info
            if (costEstimate.laborRate) {
                doc.fontSize(9)
                    .fillColor('#9CA3AF')
                    .text(`Labor rate: ${formatINR(costEstimate.laborRate.hourlyRate)}/hr (${costEstimate.laborRate.tier} tier - ${costEstimate.laborRate.city})`,
                        60, breakdownY + 40);
            }

            doc.y = breakdownY + 55;
        }

        doc.moveDown(1);

        // ========================================
        // DAMAGE IMAGES
        // ========================================
        doc.fontSize(14)
            .fillColor('#111827')
            .text('Damage Analysis', { underline: true });
        doc.moveDown(0.5);

        // Download and embed images
        let imagesAdded = false;
        const imageWidth = 235;
        const imageHeight = 160;
        const imagesY = doc.y;

        if (annotatedImageUrl) {
            const annotatedBuffer = await downloadImage(annotatedImageUrl);
            if (annotatedBuffer) {
                doc.fontSize(10).fillColor('#6B7280').text('Annotated Image:', 50, imagesY);
                doc.image(annotatedBuffer, 50, imagesY + 15, {
                    width: imageWidth,
                    height: imageHeight,
                    fit: [imageWidth, imageHeight]
                });
                imagesAdded = true;
            }
        }

        if (heatmapUrl) {
            const heatmapBuffer = await downloadImage(heatmapUrl);
            if (heatmapBuffer) {
                doc.fontSize(10).fillColor('#6B7280').text('Depth Heatmap:', 300, imagesY);
                doc.image(heatmapBuffer, 300, imagesY + 15, {
                    width: imageWidth,
                    height: imageHeight,
                    fit: [imageWidth, imageHeight]
                });
                imagesAdded = true;
            }
        }

        if (imagesAdded) {
            doc.y = imagesY + imageHeight + 30;
        }

        doc.moveDown(1);

        // ========================================
        // DETECTED DAMAGES LIST
        // ========================================
        doc.fontSize(14)
            .fillColor('#111827')
            .text('Detected Issues', { underline: true });
        doc.moveDown(0.5);

        if (detections.length > 0) {
            // Table header
            const tableTop = doc.y;
            doc.fontSize(10).fillColor('#6B7280');
            doc.text('Part', 50, tableTop, { width: 120 });
            doc.text('Damage Type', 170, tableTop, { width: 120 });
            doc.text('Severity', 290, tableTop, { width: 100 });
            doc.text('Recommendation', 390, tableTop, { width: 150 });

            doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#E5E7EB');

            let rowY = tableTop + 22;

            for (const detection of detections) {
                // Check if we need a new page
                if (rowY > 750) {
                    doc.addPage();
                    rowY = 50;
                }

                const severity = detection.severityScore || 0;
                const severityInfo = getSeverityInfo(severity);

                doc.fontSize(10).fillColor('#374151');
                doc.text(detection.partDetected || 'Unknown', 50, rowY, { width: 120 });
                doc.text(detection.damageType || 'Unknown', 170, rowY, { width: 120 });
                doc.text(`${Math.round(severity)}%`, 290, rowY, { width: 50 });

                doc.fillColor(severityInfo.color)
                    .text(severityInfo.label, 390, rowY, { width: 150 });

                rowY += 20;
            }

            doc.y = rowY + 10;
        } else {
            doc.fontSize(11)
                .fillColor('#10B981')
                .text('No damage detected. Vehicle appears to be in good condition.');
        }

        doc.moveDown(2);

        // ========================================
        // FOOTER
        // ========================================
        doc.fontSize(9)
            .fillColor('#9CA3AF')
            .text('This report is generated by Digital Surveyor AI-powered damage assessment system.',
                50, 780, { align: 'center', width: 495 });
        doc.text('Estimates are approximate and may vary based on actual repair shop pricing.',
            50, 795, { align: 'center', width: 495 });

        // Finalize PDF
        doc.end();

        // Wait for write to complete
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        // Return JSON with download URL
        res.json({
            success: true,
            message: 'PDF generated successfully',
            pdfUrl: `/api/reports/download/${fileName}`,
            fileName: fileName
        });

        // Clean up file after 10 minutes
        setTimeout(() => {
            fs.unlink(filePath, () => { });
        }, 10 * 60 * 1000);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF report' });
    }
});

/**
 * GET /api/reports/download/:filename
 * Download a generated PDF
 */
router.get('/download/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(reportsDir, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'PDF not found or expired' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

/**
 * GET /api/reports/:id
 * Get a saved report by ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const report = await prisma.report.findUnique({
            where: { id: req.params.id },
            include: {
                damages: true,
                images: true,
                user: {
                    select: { name: true, email: true, phone: true, city: true, state: true }
                }
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

export default router;
