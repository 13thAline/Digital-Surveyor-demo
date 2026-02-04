import { BACKEND_URL, AI_SERVER_URL } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_STORAGE_KEY } from '../config/constants';

/**
 * Get authorization headers if token exists
 */
const getAuthHeaders = async () => {
    try {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
    } catch (error) {
        console.log('Could not get auth token');
    }
    return {};
};

/**
 * Get user's city from storage for pricing
 */
const getUserCity = async () => {
    try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData) {
            const user = JSON.parse(userData);
            return user.city || 'default';
        }
    } catch (error) {
        console.log('Could not get user city');
    }
    return 'default';
};

/**
 * Upload image and analyze for damage
 * Routes through backend which proxies to AI server and enriches with pricing
 * @param {string} imageUri - Local URI of the image
 * @returns {Promise} API response with detections and cost estimate
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

        // Add city for pricing calculation
        const city = await getUserCity();
        formData.append('city', city);

        // Get auth headers
        const authHeaders = await getAuthHeaders();

        // Route through backend (which proxies to AI server and adds pricing)
        const response = await fetch(`${BACKEND_URL}/api/analyze`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...authHeaders
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            data: {
                reportId: data.reportId,
                detections: data.detections || [],
                annotatedImageUrl: data.annotatedImageUrl,
                heatmapUrl: data.heatmapUrl,
                costEstimate: data.costEstimate,
                city: data.city
            },
        };
    } catch (error) {
        console.error('Analysis error:', error);

        // If backend fails, try direct AI server as fallback (no pricing)
        if (error.message.includes('Network request failed') || error.message === 'AI server is not available') {
            console.log('Backend unavailable, trying direct AI server...');
            return await analyzeImageDirect(imageUri);
        }

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Fallback: Direct AI server analysis (no backend pricing)
 */
const analyzeImageDirect = async (imageUri) => {
    try {
        const formData = new FormData();

        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('file', {
            uri: imageUri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });

        const response = await fetch(`${AI_SERVER_URL}/analyze`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`AI server error: ${response.status}`);
        }

        const data = await response.json();

        // Calculate client-side cost estimate
        const costEstimate = calculateLocalCostEstimate(data.detections || []);

        return {
            success: true,
            data: {
                detections: data.detections || [],
                annotatedImageUrl: data.annotatedImageUrl
                    ? `${AI_SERVER_URL}${data.annotatedImageUrl}`
                    : null,
                heatmapUrl: data.heatmapUrl
                    ? `${AI_SERVER_URL}${data.heatmapUrl}`
                    : null,
                costEstimate,
            },
        };
    } catch (error) {
        console.error('Direct AI analysis error:', error);
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
    let combinedCostEstimate = null;

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

            // Accumulate cost estimates
            if (result.data.costEstimate) {
                if (!combinedCostEstimate) {
                    combinedCostEstimate = { ...result.data.costEstimate };
                } else {
                    combinedCostEstimate.total.min += result.data.costEstimate.total.min;
                    combinedCostEstimate.total.max += result.data.costEstimate.total.max;
                    combinedCostEstimate.parts.min += result.data.costEstimate.parts.min;
                    combinedCostEstimate.parts.max += result.data.costEstimate.parts.max;
                    combinedCostEstimate.labor.min += result.data.costEstimate.labor.min;
                    combinedCostEstimate.labor.max += result.data.costEstimate.labor.max;
                    if (result.data.costEstimate.breakdown) {
                        combinedCostEstimate.breakdown = [
                            ...(combinedCostEstimate.breakdown || []),
                            ...result.data.costEstimate.breakdown
                        ];
                    }
                }
            }
        }
    }

    // If no backend cost estimate, calculate locally
    if (!combinedCostEstimate) {
        combinedCostEstimate = calculateLocalCostEstimate(allDetections);
    }

    return {
        success: true,
        data: {
            detections: allDetections,
            annotatedImageUrl,
            heatmapUrl,
            costEstimate: combinedCostEstimate,
        },
    };
};

/**
 * Local fallback: Calculate repair cost estimate based on detections
 * Used when backend is unavailable
 */
const calculateLocalCostEstimate = (detections) => {
    let minCost = 0;
    let maxCost = 0;
    let partsMin = 0;
    let partsMax = 0;

    const breakdown = [];

    detections.forEach((detection) => {
        const severity = detection.severityScore || 0;

        // Base cost calculation per detection (in INR)
        let partMin, partMax;
        if (severity > 50) {
            // High severity - needs replacement
            partMin = 8000;
            partMax = 15000;
        } else if (severity > 20) {
            // Medium severity - major repair
            partMin = 4000;
            partMax = 8000;
        } else {
            // Low severity - minor repair
            partMin = 1000;
            partMax = 3000;
        }

        partsMin += partMin;
        partsMax += partMax;

        breakdown.push({
            part: detection.partDetected || 'Unknown',
            damageType: detection.damageType,
            severity: severity,
            partCost: { min: partMin, max: partMax }
        });
    });

    // Labor cost (2-4 hours at ₹400/hr average)
    const laborMin = Math.ceil(detections.length * 2) * 400;
    const laborMax = Math.ceil(detections.length * 3.5) * 500;

    minCost = partsMin + laborMin;
    maxCost = partsMax + laborMax;

    return {
        total: { min: minCost, max: maxCost },
        parts: { min: partsMin, max: partsMax },
        labor: { min: laborMin, max: laborMax },
        breakdown,
        isLocalEstimate: true // Flag to indicate this is a fallback estimate
    };
};

/**
 * Get labor costs for all cities
 */
export const getLaborCosts = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze/labor-costs`);
        if (!response.ok) {
            throw new Error('Failed to fetch labor costs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching labor costs:', error);
        return [];
    }
};

/**
 * Get labor cost for a specific city
 */
export const getLaborCostByCity = async (city) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze/labor-costs/${encodeURIComponent(city)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch labor cost');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching labor cost:', error);
        return null;
    }
};

export default {
    analyzeImage,
    analyzeMultipleImages,
    getLaborCosts,
    getLaborCostByCity
};
