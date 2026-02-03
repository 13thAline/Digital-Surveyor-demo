import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:8000';

export interface AIAnalysisResult {
    partDetected: string;
    damageType: string;
    severityScore: number;
    confidenceScore: number;
    depthEstimate?: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    annotatedImageUrl?: string;
    heatmapUrl?: string;
}

// Mock results for development when AI server is not available
const mockResults: AIAnalysisResult[] = [
    {
        partDetected: 'Front Bumper',
        damageType: 'Dent',
        severityScore: 45,
        confidenceScore: 0.92,
        depthEstimate: 2.5,
        boundingBox: { x: 120, y: 200, width: 180, height: 120 },
    },
    {
        partDetected: 'Driver Door',
        damageType: 'Scratch',
        severityScore: 25,
        confidenceScore: 0.88,
        depthEstimate: 0.5,
        boundingBox: { x: 80, y: 150, width: 200, height: 100 },
    },
    {
        partDetected: 'Rear Fender',
        damageType: 'Deep Dent',
        severityScore: 72,
        confidenceScore: 0.95,
        depthEstimate: 8.3,
        boundingBox: { x: 200, y: 280, width: 160, height: 140 },
    },
    {
        partDetected: 'Hood',
        damageType: 'Crease',
        severityScore: 58,
        confidenceScore: 0.91,
        depthEstimate: 4.2,
        boundingBox: { x: 100, y: 100, width: 250, height: 180 },
    },
];

export async function analyzeWithAI(imagePath: string): Promise<AIAnalysisResult> {
    try {
        // Try to connect to AI server
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imagePath));

        const response = await fetch(`${AI_SERVER_URL}/analyze`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });

        if (response.ok) {
            const result = await response.json() as AIAnalysisResult;
            console.log('✅ AI Server analysis successful');
            return result;
        }

        throw new Error(`AI Server returned status ${response.status}`);
    } catch (error) {
        // Fall back to mock data if AI server is unavailable
        console.log('⚠️ AI Server unavailable, using mock data');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Return random mock result
        const randomIndex = Math.floor(Math.random() * mockResults.length);
        return mockResults[randomIndex];
    }
}

export async function checkAIServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${AI_SERVER_URL}/health`, {
            method: 'GET',
            timeout: 5000,
        } as any);
        return response.ok;
    } catch {
        return false;
    }
}
