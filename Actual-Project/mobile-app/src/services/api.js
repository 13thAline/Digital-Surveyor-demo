import { API_URL } from '../config/constants';

/**
 * Upload image and analyze for damage
 * @param {string} imageUri - Local URI of the image
 * @returns {Promise} API response with detections
 */
export const analyzeImage = async (imageUri) => {
    try {
        const formData = new FormData();

        // Get file extension from URI
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('file', {
            uri: imageUri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });

        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: {
                detections: data.detections || [],
                annotatedImageUrl: data.annotatedImageUrl
                    ? `${API_URL}${data.annotatedImageUrl}`
                    : null,
                heatmapUrl: data.heatmapUrl
                    ? `${API_URL}${data.heatmapUrl}`
                    : null,
            },
        };
    } catch (error) {
        console.error('Analysis error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Analyze multiple images
 * @param {string[]} imageUris - Array of local image URIs
 * @returns {Promise} Combined analysis results
 */
export const analyzeMultipleImages = async (imageUris) => {
    const results = [];
    const allDetections = [];
    let annotatedImageUrl = null;
    let heatmapUrl = null;

    for (const uri of imageUris) {
        const result = await analyzeImage(uri);
        if (result.success) {
            results.push(result.data);
            allDetections.push(...result.data.detections);
            // Use the first available images
            if (!annotatedImageUrl && result.data.annotatedImageUrl) {
                annotatedImageUrl = result.data.annotatedImageUrl;
            }
            if (!heatmapUrl && result.data.heatmapUrl) {
                heatmapUrl = result.data.heatmapUrl;
            }
        }
    }

    // Calculate cost estimates based on detections
    const costEstimate = calculateCostEstimate(allDetections);

    return {
        success: true,
        data: {
            detections: allDetections,
            annotatedImageUrl,
            heatmapUrl,
            costEstimate,
        },
    };
};

/**
 * Calculate repair cost estimate based on detections
 */
const calculateCostEstimate = (detections) => {
    let minCost = 0;
    let maxCost = 0;
    let partsMin = 0;
    let partsMax = 0;

    detections.forEach((detection) => {
        const severity = detection.severityScore || 0;

        // Base cost calculation per detection
        if (severity > 70) {
            // High severity - needs replacement
            partsMin += 400;
            partsMax += 600;
        } else if (severity > 40) {
            // Medium severity - major repair
            partsMin += 200;
            partsMax += 400;
        } else {
            // Low severity - minor repair
            partsMin += 50;
            partsMax += 150;
        }
    });

    // Labor cost (4-6 hours at $60-80/hr average)
    const laborMin = Math.ceil(detections.length * 1.5) * 60;
    const laborMax = Math.ceil(detections.length * 2) * 80;

    minCost = partsMin + laborMin;
    maxCost = partsMax + laborMax;

    return {
        total: { min: minCost, max: maxCost },
        parts: { min: partsMin, max: partsMax },
        labor: { min: laborMin, max: laborMax },
    };
};

export default {
    analyzeImage,
    analyzeMultipleImages,
};
