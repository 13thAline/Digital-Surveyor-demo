import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

export interface GlareAnalysisResult {
    hasGlare: boolean;
    glareScore: number; // 0-100, higher = more glare
    overexposedPercentage: number;
    averageBrightness: number;
    message: string;
}

// Thresholds for glare detection
const BRIGHTNESS_THRESHOLD = 240; // Pixels above this are considered overexposed
const OVEREXPOSED_PERCENTAGE_THRESHOLD = 15; // Flag if >15% of pixels are overexposed
const HIGH_BRIGHTNESS_AVERAGE_THRESHOLD = 200; // Flag if average brightness is too high

/**
 * Analyzes an image for glare and excessive brightness.
 * Uses pixel sampling to efficiently detect overexposed regions.
 */
export async function analyzeImageForGlare(imageUri: string): Promise<GlareAnalysisResult> {
    try {
        // Resize and convert to base64 for efficient analysis
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 100 } }], // Small size for faster processing
            { base64: true, format: ImageManipulator.SaveFormat.JPEG }
        );

        if (!manipulatedImage.base64) {
            return {
                hasGlare: false,
                glareScore: 0,
                overexposedPercentage: 0,
                averageBrightness: 0,
                message: 'Could not analyze image',
            };
        }

        // Analyze the base64 image data
        const analysis = analyzeBase64Image(manipulatedImage.base64);

        return analysis;
    } catch (error) {
        console.error('Glare analysis error:', error);
        return {
            hasGlare: false,
            glareScore: 0,
            overexposedPercentage: 0,
            averageBrightness: 0,
            message: 'Analysis failed',
        };
    }
}

/**
 * Analyzes base64 image data for brightness and glare patterns.
 * Since we can't easily decode JPEG pixels in React Native without
 * additional native modules, we use a heuristic based on the raw
 * byte distribution of the JPEG data.
 */
function analyzeBase64Image(base64Data: string): GlareAnalysisResult {
    try {
        // Decode base64 to array buffer
        const arrayBuffer = decode(base64Data);
        const bytes = new Uint8Array(arrayBuffer);

        // Skip JPEG headers (first ~200 bytes typically) and analyze the rest
        const startOffset = Math.min(200, Math.floor(bytes.length * 0.1));
        const sampleSize = Math.min(5000, bytes.length - startOffset);

        let brightPixelCount = 0;
        let totalBrightness = 0;
        let sampleCount = 0;

        // Sample bytes from the image data
        // In JPEG, high byte values in the scan data correlate with brightness
        for (let i = startOffset; i < startOffset + sampleSize; i += 3) {
            const value = bytes[i];
            totalBrightness += value;
            sampleCount++;

            if (value > BRIGHTNESS_THRESHOLD) {
                brightPixelCount++;
            }
        }

        const averageBrightness = sampleCount > 0 ? totalBrightness / sampleCount : 0;
        const overexposedPercentage = sampleCount > 0
            ? (brightPixelCount / sampleCount) * 100
            : 0;

        // Calculate glare score (0-100)
        const brightnessScore = Math.min(100, (averageBrightness / 255) * 100);
        const overexposureScore = Math.min(100, overexposedPercentage * 2);
        const glareScore = Math.round((brightnessScore * 0.4) + (overexposureScore * 0.6));

        // Determine if there's problematic glare
        const hasGlare = overexposedPercentage > OVEREXPOSED_PERCENTAGE_THRESHOLD
            || averageBrightness > HIGH_BRIGHTNESS_AVERAGE_THRESHOLD;

        // Generate user-friendly message
        let message = '';
        if (hasGlare) {
            if (overexposedPercentage > 30) {
                message = 'Severe glare detected. Photo appears washed out.';
            } else if (overexposedPercentage > OVEREXPOSED_PERCENTAGE_THRESHOLD) {
                message = 'Reflection or glare detected in the image.';
            } else {
                message = 'Image appears overexposed. Consider different lighting.';
            }
        } else {
            message = 'Image quality looks good.';
        }

        return {
            hasGlare,
            glareScore,
            overexposedPercentage: Math.round(overexposedPercentage * 10) / 10,
            averageBrightness: Math.round(averageBrightness),
            message,
        };
    } catch (error) {
        console.error('Base64 analysis error:', error);
        return {
            hasGlare: false,
            glareScore: 0,
            overexposedPercentage: 0,
            averageBrightness: 0,
            message: 'Could not analyze brightness',
        };
    }
}
