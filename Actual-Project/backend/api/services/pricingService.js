import prisma from '../lib/prisma.js';

/**
 * Default part prices (fallback when database is empty)
 * Prices in INR
 */
const DEFAULT_PART_PRICES = {
    'bumper': { min: 3000, max: 15000, avg: 8000, category: 'body' },
    'front_bumper': { min: 4000, max: 18000, avg: 10000, category: 'body' },
    'rear_bumper': { min: 3500, max: 16000, avg: 9000, category: 'body' },
    'fender': { min: 2500, max: 12000, avg: 6000, category: 'body' },
    'door': { min: 8000, max: 35000, avg: 18000, category: 'body' },
    'hood': { min: 6000, max: 25000, avg: 14000, category: 'body' },
    'bonnet': { min: 6000, max: 25000, avg: 14000, category: 'body' },
    'trunk': { min: 5000, max: 22000, avg: 12000, category: 'body' },
    'roof': { min: 10000, max: 40000, avg: 22000, category: 'body' },
    'quarter_panel': { min: 8000, max: 30000, avg: 16000, category: 'body' },
    'side_mirror': { min: 1500, max: 8000, avg: 4000, category: 'body' },
    'headlight': { min: 3000, max: 20000, avg: 10000, category: 'lights' },
    'taillight': { min: 2000, max: 12000, avg: 6000, category: 'lights' },
    'windshield': { min: 5000, max: 25000, avg: 12000, category: 'glass' },
    'window': { min: 2000, max: 10000, avg: 5000, category: 'glass' },
    'grille': { min: 2000, max: 15000, avg: 7000, category: 'body' },
    'default': { min: 2000, max: 10000, avg: 5000, category: 'body' }
};

/**
 * Default labor rates by city tier (INR per hour)
 */
const DEFAULT_LABOR_RATES = {
    'metro': 600,     // Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad
    'tier1': 450,     // Pune, Ahmedabad, Jaipur, Lucknow
    'tier2': 350,     // Smaller cities
    'tier3': 250      // Rural/smaller towns
};

/**
 * Location multipliers
 */
const LOCATION_MULTIPLIERS = {
    'metro': 1.2,
    'tier1': 1.1,
    'tier2': 1.0,
    'tier3': 0.85
};

/**
 * Get labor rate for a city
 * @param {string} city - City name
 * @returns {Promise<{hourlyRate: number, tier: string}>}
 */
export const getLaborRate = async (city) => {
    try {
        // Try to find in database
        const laborCost = await prisma.laborCost.findFirst({
            where: {
                city: {
                    equals: city,
                    mode: 'insensitive'
                }
            }
        });

        if (laborCost) {
            return {
                hourlyRate: laborCost.hourlyRate,
                tier: laborCost.tier
            };
        }

        // Fallback to default tier2 rate
        return {
            hourlyRate: DEFAULT_LABOR_RATES.tier2,
            tier: 'tier2'
        };
    } catch (error) {
        console.error('Error fetching labor rate:', error);
        return {
            hourlyRate: DEFAULT_LABOR_RATES.tier2,
            tier: 'tier2'
        };
    }
};

/**
 * Get part price
 * @param {string} partName - Name of the part
 * @returns {Promise<{min: number, max: number, avg: number}>}
 */
export const getPartPrice = async (partName) => {
    try {
        // Normalize part name
        const normalizedName = partName.toLowerCase().replace(/\s+/g, '_');

        // Try database first
        const partPrice = await prisma.partPrice.findFirst({
            where: {
                partName: {
                    contains: normalizedName,
                    mode: 'insensitive'
                }
            }
        });

        if (partPrice) {
            return {
                min: partPrice.minPrice,
                max: partPrice.maxPrice,
                avg: partPrice.avgPrice
            };
        }

        // Fallback to hardcoded prices
        const defaultPrice = DEFAULT_PART_PRICES[normalizedName] || DEFAULT_PART_PRICES['default'];
        return {
            min: defaultPrice.min,
            max: defaultPrice.max,
            avg: defaultPrice.avg
        };
    } catch (error) {
        console.error('Error fetching part price:', error);
        const defaultPrice = DEFAULT_PART_PRICES['default'];
        return {
            min: defaultPrice.min,
            max: defaultPrice.max,
            avg: defaultPrice.avg
        };
    }
};

/**
 * Calculate severity multiplier
 * Severity 0-100 maps to repair effort/cost factor
 * @param {number} severityScore - 0 to 100
 * @returns {number} multiplier between 0.1 and 1.0
 */
const getSeverityMultiplier = (severityScore) => {
    if (severityScore <= 10) return 0.15;      // Minor scratch
    if (severityScore <= 25) return 0.30;      // Light damage
    if (severityScore <= 50) return 0.55;      // Moderate damage
    if (severityScore <= 75) return 0.80;      // Significant damage
    return 1.0;                                 // Severe/replacement needed
};

/**
 * Estimate labor hours based on damage severity and part type
 * @param {number} severityScore 
 * @param {string} partName 
 * @returns {number} estimated hours
 */
const estimateLaborHours = (severityScore, partName) => {
    const normalizedPart = partName.toLowerCase();

    // Base hours by part complexity
    let baseHours = 2;
    if (['door', 'hood', 'bonnet', 'trunk', 'roof'].some(p => normalizedPart.includes(p))) {
        baseHours = 4;
    } else if (['quarter_panel', 'frame'].some(p => normalizedPart.includes(p))) {
        baseHours = 6;
    } else if (['bumper', 'fender'].some(p => normalizedPart.includes(p))) {
        baseHours = 3;
    }

    // Scale by severity
    const severityFactor = getSeverityMultiplier(severityScore);
    return Math.ceil(baseHours * (0.5 + severityFactor));
};

/**
 * Calculate repair cost estimate for all detections
 * Formula: (Base Part Price + Labor Cost) × Damage Severity × Location Multiplier
 * @param {Array} detections - Array of detection objects from AI server
 * @param {string} city - User's city for labor rates
 * @returns {Promise<Object>} Cost estimate breakdown
 */
export const calculateRepairCost = async (detections, city = 'default') => {
    const laborData = await getLaborRate(city);
    const locationMultiplier = LOCATION_MULTIPLIERS[laborData.tier] || 1.0;

    let totalPartsMin = 0;
    let totalPartsMax = 0;
    let totalLaborMin = 0;
    let totalLaborMax = 0;

    const breakdown = [];

    for (const detection of detections) {
        const partName = detection.partDetected || detection.damageType || 'default';
        const severityScore = detection.severityScore || 0;

        // Get part price
        const partPrice = await getPartPrice(partName);
        const severityMultiplier = getSeverityMultiplier(severityScore);

        // Calculate part cost (scaled by severity)
        const partCostMin = Math.round(partPrice.min * severityMultiplier);
        const partCostMax = Math.round(partPrice.max * severityMultiplier);

        // Calculate labor cost
        const laborHours = estimateLaborHours(severityScore, partName);
        const laborCost = Math.round(laborHours * laborData.hourlyRate);

        // Apply location multiplier
        const adjustedPartMin = Math.round(partCostMin * locationMultiplier);
        const adjustedPartMax = Math.round(partCostMax * locationMultiplier);
        const adjustedLabor = Math.round(laborCost * locationMultiplier);

        totalPartsMin += adjustedPartMin;
        totalPartsMax += adjustedPartMax;
        totalLaborMin += Math.round(adjustedLabor * 0.8); // Min estimate
        totalLaborMax += Math.round(adjustedLabor * 1.2); // Max estimate

        breakdown.push({
            part: partName,
            damageType: detection.damageType,
            severity: severityScore,
            severityLevel: getSeverityLevel(severityScore),
            partCost: { min: adjustedPartMin, max: adjustedPartMax },
            laborCost: { min: Math.round(adjustedLabor * 0.8), max: Math.round(adjustedLabor * 1.2) },
            laborHours: laborHours,
            total: {
                min: adjustedPartMin + Math.round(adjustedLabor * 0.8),
                max: adjustedPartMax + Math.round(adjustedLabor * 1.2)
            }
        });
    }

    return {
        total: {
            min: totalPartsMin + totalLaborMin,
            max: totalPartsMax + totalLaborMax
        },
        parts: {
            min: totalPartsMin,
            max: totalPartsMax
        },
        labor: {
            min: totalLaborMin,
            max: totalLaborMax
        },
        laborRate: {
            hourlyRate: laborData.hourlyRate,
            tier: laborData.tier,
            city: city
        },
        locationMultiplier: locationMultiplier,
        breakdown: breakdown
    };
};

/**
 * Convert severity score to human-readable level and repair recommendation
 * >50% = Needs Replacement
 * 20-50% = May be repairable  
 * <20% = Repairable (likely repaint)
 */
const getSeverityLevel = (score) => {
    if (score > 50) return 'Replace';
    if (score >= 20) return 'May be repairable';
    return 'Repairable (repaint)';
};

export default {
    calculateRepairCost,
    getLaborRate,
    getPartPrice
};
