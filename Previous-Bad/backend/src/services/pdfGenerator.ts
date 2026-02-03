import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface ReportData {
    reportId: string;
    analysisId: string;
    generatedAt: string;
    customerName: string;
    vehicleInfo: {
        make?: string;
        model?: string;
        year?: string;
        vin?: string;
    };
    detection: {
        partDetected: string;
        damageType: string;
        severityScore: number;
        confidenceScore: number;
    };
    estimate: {
        partsCost: number;
        laborCost: number;
        totalCost: number;
        locationMultiplier: number;
    };
    imageUrl?: string;
    annotatedImageUrl?: string;
    heatmapUrl?: string;
}

// Helper function to download image from URL
async function downloadImage(url: string): Promise<Buffer | null> {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
        return null;
    } catch (error) {
        console.log(`Failed to download image from ${url}:`, error);
        return null;
    }
}

export async function generatePDFReport(data: ReportData): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const reportsDir = './reports';
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const pdfPath = path.join(reportsDir, `${data.reportId}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(pdfPath);

        doc.pipe(stream);

        // Header
        doc
            .fontSize(24)
            .fillColor('#00D4AA')
            .text('Digital Surveyor', { align: 'center' })
            .fontSize(14)
            .fillColor('#666')
            .text('AI-Powered Vehicle Damage Assessment Report', { align: 'center' })
            .moveDown(2);

        // Report Info
        doc
            .fontSize(10)
            .fillColor('#999')
            .text(`Report ID: ${data.reportId}`)
            .text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`)
            .moveDown(2);

        // Customer & Vehicle Info
        doc
            .fontSize(14)
            .fillColor('#333')
            .text('Customer Information', { underline: true })
            .moveDown(0.5)
            .fontSize(12)
            .text(`Name: ${data.customerName}`)
            .moveDown();

        if (data.vehicleInfo.make || data.vehicleInfo.model) {
            doc
                .fontSize(14)
                .text('Vehicle Information', { underline: true })
                .moveDown(0.5)
                .fontSize(12);

            if (data.vehicleInfo.year) doc.text(`Year: ${data.vehicleInfo.year}`);
            if (data.vehicleInfo.make) doc.text(`Make: ${data.vehicleInfo.make}`);
            if (data.vehicleInfo.model) doc.text(`Model: ${data.vehicleInfo.model}`);
            if (data.vehicleInfo.vin) doc.text(`VIN: ${data.vehicleInfo.vin}`);
            doc.moveDown();
        }

        // Photo Evidence Section - Download and embed images
        const hasImages = data.annotatedImageUrl || data.heatmapUrl;
        if (hasImages) {
            doc
                .addPage()
                .fontSize(16)
                .fillColor('#333')
                .text('Photo Evidence', { underline: true })
                .moveDown();

            // Annotated damage image
            if (data.annotatedImageUrl) {
                doc
                    .fontSize(12)
                    .fillColor('#666')
                    .text('AI-Detected Damage Area:', { continued: false })
                    .moveDown(0.5);

                const annotatedImage = await downloadImage(data.annotatedImageUrl);
                if (annotatedImage) {
                    doc.image(annotatedImage, {
                        fit: [400, 250],
                        align: 'center',
                    });
                } else {
                    doc.fontSize(10).fillColor('#999').text('(Image not available)');
                }
                doc.moveDown();
            }

            // Heatmap image
            if (data.heatmapUrl) {
                doc
                    .fontSize(12)
                    .fillColor('#666')
                    .text('ZoeDepth Severity Heatmap:', { continued: false })
                    .moveDown(0.5);

                const heatmapImage = await downloadImage(data.heatmapUrl);
                if (heatmapImage) {
                    doc.image(heatmapImage, {
                        fit: [400, 250],
                        align: 'center',
                    });
                } else {
                    doc.fontSize(10).fillColor('#999').text('(Image not available)');
                }
                doc.moveDown();
            }
        }

        // Damage Assessment Section
        doc
            .addPage()
            .fontSize(16)
            .fillColor('#333')
            .text('Damage Assessment', { underline: true })
            .moveDown();

        // Detection Details
        doc
            .fontSize(12)
            .text(`Part Detected: `, { continued: true })
            .fillColor('#00D4AA')
            .text(data.detection.partDetected)
            .fillColor('#333')
            .text(`Damage Type: `, { continued: true })
            .fillColor('#F59E0B')
            .text(data.detection.damageType)
            .fillColor('#333');

        // Severity with color coding
        const severityColor =
            data.detection.severityScore < 30 ? '#10B981' :
                data.detection.severityScore < 60 ? '#F59E0B' : '#EF4444';

        const severityLabel =
            data.detection.severityScore < 30 ? 'Minor' :
                data.detection.severityScore < 60 ? 'Moderate' : 'Severe';

        doc
            .text(`Severity Score: `, { continued: true })
            .fillColor(severityColor)
            .text(`${data.detection.severityScore}% (${severityLabel})`)
            .fillColor('#333')
            .text(`AI Confidence: ${(data.detection.confidenceScore * 100).toFixed(1)}%`)
            .moveDown(2);

        // Cost Estimate Section
        doc
            .fontSize(16)
            .text('Repair Cost Estimate', { underline: true })
            .moveDown();

        // Cost breakdown table
        const tableTop = doc.y;
        const tableLeft = 50;

        doc
            .fontSize(12)
            .text('Parts Cost:', tableLeft, tableTop)
            .text(`$${data.estimate.partsCost.toLocaleString()}`, tableLeft + 200, tableTop, { align: 'right', width: 100 });

        doc
            .text('Labor Cost:', tableLeft, tableTop + 20)
            .text(`$${data.estimate.laborCost.toLocaleString()}`, tableLeft + 200, tableTop + 20, { align: 'right', width: 100 });

        // Divider line
        doc
            .moveTo(tableLeft, tableTop + 45)
            .lineTo(tableLeft + 300, tableTop + 45)
            .stroke('#ccc');

        // Total
        doc
            .fontSize(14)
            .fillColor('#00D4AA')
            .text('Total Estimate:', tableLeft, tableTop + 55)
            .fontSize(16)
            .text(`$${data.estimate.totalCost.toLocaleString()}`, tableLeft + 200, tableTop + 55, { align: 'right', width: 100 });

        if (data.estimate.locationMultiplier !== 1) {
            doc
                .fontSize(10)
                .fillColor('#999')
                .text(`(includes ${((data.estimate.locationMultiplier - 1) * 100).toFixed(0)}% location adjustment)`, tableLeft, tableTop + 80);
        }

        // Footer
        doc
            .moveDown(4)
            .fontSize(10)
            .fillColor('#999')
            .text('This estimate is generated by AI analysis and may vary from actual repair costs.', { align: 'center' })
            .text('Please consult with a certified repair shop for final quotes.', { align: 'center' })
            .moveDown()
            .text('© 2024 Digital Surveyor - AI-Powered Vehicle Damage Assessment', { align: 'center' });

        doc.end();

        stream.on('finish', () => {
            console.log(`📄 PDF Report generated: ${pdfPath}`);
            resolve(pdfPath);
        });

        stream.on('error', reject);
    });
}
