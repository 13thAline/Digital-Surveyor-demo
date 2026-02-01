import { DamageResult } from '../context/AssessmentContext';

// Backend API URL - use your machine's IP for physical devices
// This IP should match the one shown in Expo's Metro bundler output
const API_BASE_URL = 'http://10.131.171.219:3000';

export async function analyzeDamage(imageUri: string): Promise<DamageResult> {
  try {
    // Create form data for image upload
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'damage.jpg',
    } as any);

    console.log('📤 Uploading image to backend...');

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis received from backend');

      return {
        partDetected: data.detection.partDetected,
        damageType: data.detection.damageType,
        severityScore: data.detection.severityScore,
        confidenceScore: data.detection.confidenceScore,
        estimatedCost: data.estimate.totalCost,
        laborCost: data.estimate.laborCost,
        partsCost: data.estimate.partsCost,
        locationMultiplier: data.estimate.locationMultiplier,
        annotatedImageUrl: data.annotatedImageUrl || null,
        heatmapUrl: data.heatmapUrl || null,
      };
    }

    throw new Error(`Server returned status ${response.status}`);
  } catch (error) {
    console.log('⚠️ Backend unavailable, using mock data');
    console.log('Error:', error);

    // Fall back to mock data if backend is not available
    return getMockResult();
  }
}

// Mock data for development
const mockDamageResults: DamageResult[] = [
  {
    partDetected: 'Front Bumper',
    damageType: 'Dent',
    severityScore: 45,
    confidenceScore: 0.92,
    estimatedCost: 450,
    laborCost: 180,
    partsCost: 270,
    locationMultiplier: 1.0,
  },
  {
    partDetected: 'Driver Door',
    damageType: 'Scratch',
    severityScore: 25,
    confidenceScore: 0.88,
    estimatedCost: 280,
    laborCost: 120,
    partsCost: 160,
    locationMultiplier: 1.0,
  },
  {
    partDetected: 'Rear Fender',
    damageType: 'Deep Dent',
    severityScore: 72,
    confidenceScore: 0.95,
    estimatedCost: 820,
    laborCost: 350,
    partsCost: 470,
    locationMultiplier: 1.0,
  },
];

async function getMockResult(): Promise<DamageResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Return random mock result
  const randomIndex = Math.floor(Math.random() * mockDamageResults.length);
  return mockDamageResults[randomIndex];
}

export async function generateReport(result: DamageResult): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        detection: {
          partDetected: result.partDetected,
          damageType: result.damageType,
          severityScore: result.severityScore,
          confidenceScore: result.confidenceScore,
        },
        estimate: {
          partsCost: result.partsCost,
          laborCost: result.laborCost,
          totalCost: result.estimatedCost,
          locationMultiplier: result.locationMultiplier,
        },
        annotatedImageUrl: result.annotatedImageUrl,
        heatmapUrl: result.heatmapUrl,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return `${API_BASE_URL}${data.pdfUrl}`;
    }

    throw new Error('Failed to generate report');
  } catch (error) {
    console.log('⚠️ Report generation failed');
    return '';
  }
}
