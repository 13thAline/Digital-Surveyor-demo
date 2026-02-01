// Price matrix for vehicle parts (in USD)
const PART_BASE_PRICES: Record<string, number> = {
    'Front Bumper': 450,
    'Rear Bumper': 400,
    'Driver Door': 650,
    'Passenger Door': 650,
    'Rear Door Left': 580,
    'Rear Door Right': 580,
    'Hood': 520,
    'Trunk': 480,
    'Fender': 380,
    'Rear Fender': 420,
    'Quarter Panel': 550,
    'Rocker Panel': 320,
    'Mirror': 180,
    'Headlight': 280,
    'Taillight': 220,
    'Windshield': 350,
    'Window': 200,
    'Default': 400,
};

// Labor rates per hour (in USD)
const LABOR_RATES: Record<string, number> = {
    'Scratch': 65,
    'Dent': 85,
    'Deep Dent': 110,
    'Crease': 95,
    'Crack': 75,
    'Chip': 55,
    'Default': 80,
};

// Labor hours multiplier based on damage type
const LABOR_HOURS: Record<string, number> = {
    'Scratch': 1.5,
    'Dent': 2.5,
    'Deep Dent': 4.0,
    'Crease': 3.0,
    'Crack': 2.0,
    'Chip': 1.0,
    'Default': 2.0,
};

// Location multipliers (cost of living adjustments)
const LOCATION_MULTIPLIERS: Record<string, number> = {
    'california': 1.35,
    'newyork': 1.40,
    'texas': 1.10,
    'florida': 1.15,
    'illinois': 1.20,
    'washington': 1.25,
    'default': 1.00,
};

interface PricingInput {
    partDetected: string;
    damageType: string;
    severityScore: number;
    location?: string;
}

interface PricingResult {
    partsCost: number;
    laborCost: number;
    totalCost: number;
    locationMultiplier: number;
    breakdown: {
        basePartPrice: number;
        partSeverityMultiplier: number;
        laborRate: number;
        laborHours: number;
        severityAdjustment: number;
    };
}

export function calculateRepairCost(input: PricingInput): PricingResult {
    const { partDetected, damageType, severityScore, location = 'default' } = input;

    // Get base prices
    const basePartPrice = PART_BASE_PRICES[partDetected] || PART_BASE_PRICES['Default'];
    const laborRate = LABOR_RATES[damageType] || LABOR_RATES['Default'];
    const laborHours = LABOR_HOURS[damageType] || LABOR_HOURS['Default'];
    const locationMultiplier = LOCATION_MULTIPLIERS[location.toLowerCase()] || LOCATION_MULTIPLIERS['default'];

    // Severity adjustment (0-100 → 0.3-1.5 multiplier)
    // Minor damage (0-30) = 30-60% of base
    // Moderate damage (30-60) = 60-100% of base
    // Severe damage (60-100) = 100-150% of base
    const severityAdjustment = 0.3 + (severityScore / 100) * 1.2;

    // Calculate costs
    const partsCost = Math.round(basePartPrice * severityAdjustment);
    const laborCost = Math.round(laborRate * laborHours * severityAdjustment);

    // Apply location multiplier
    const totalCost = Math.round((partsCost + laborCost) * locationMultiplier);

    return {
        partsCost: Math.round(partsCost * locationMultiplier),
        laborCost: Math.round(laborCost * locationMultiplier),
        totalCost,
        locationMultiplier,
        breakdown: {
            basePartPrice,
            partSeverityMultiplier: severityAdjustment,
            laborRate,
            laborHours,
            severityAdjustment,
        },
    };
}

// Formula explanation: (Base Part Price + Labor Cost) * Damage Severity * Location Multiplier
