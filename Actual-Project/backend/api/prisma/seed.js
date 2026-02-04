import prisma from '../lib/prisma.js';

/**
 * Seed data for Indian cities - Labor costs
 */
const laborCostsData = [
    // Metro cities (Tier: metro)
    { city: 'Mumbai', state: 'Maharashtra', hourlyRate: 700, tier: 'metro' },
    { city: 'Delhi', state: 'Delhi', hourlyRate: 650, tier: 'metro' },
    { city: 'Bangalore', state: 'Karnataka', hourlyRate: 680, tier: 'metro' },
    { city: 'Bengaluru', state: 'Karnataka', hourlyRate: 680, tier: 'metro' },
    { city: 'Chennai', state: 'Tamil Nadu', hourlyRate: 600, tier: 'metro' },
    { city: 'Kolkata', state: 'West Bengal', hourlyRate: 550, tier: 'metro' },
    { city: 'Hyderabad', state: 'Telangana', hourlyRate: 620, tier: 'metro' },

    // Tier 1 cities
    { city: 'Pune', state: 'Maharashtra', hourlyRate: 520, tier: 'tier1' },
    { city: 'Ahmedabad', state: 'Gujarat', hourlyRate: 480, tier: 'tier1' },
    { city: 'Jaipur', state: 'Rajasthan', hourlyRate: 450, tier: 'tier1' },
    { city: 'Lucknow', state: 'Uttar Pradesh', hourlyRate: 420, tier: 'tier1' },
    { city: 'Surat', state: 'Gujarat', hourlyRate: 460, tier: 'tier1' },
    { city: 'Chandigarh', state: 'Chandigarh', hourlyRate: 500, tier: 'tier1' },
    { city: 'Kochi', state: 'Kerala', hourlyRate: 480, tier: 'tier1' },
    { city: 'Coimbatore', state: 'Tamil Nadu', hourlyRate: 440, tier: 'tier1' },
    { city: 'Indore', state: 'Madhya Pradesh', hourlyRate: 400, tier: 'tier1' },
    { city: 'Nagpur', state: 'Maharashtra', hourlyRate: 420, tier: 'tier1' },

    // Tier 2 cities
    { city: 'Vadodara', state: 'Gujarat', hourlyRate: 380, tier: 'tier2' },
    { city: 'Bhopal', state: 'Madhya Pradesh', hourlyRate: 360, tier: 'tier2' },
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', hourlyRate: 370, tier: 'tier2' },
    { city: 'Patna', state: 'Bihar', hourlyRate: 320, tier: 'tier2' },
    { city: 'Thiruvananthapuram', state: 'Kerala', hourlyRate: 400, tier: 'tier2' },
    { city: 'Kanpur', state: 'Uttar Pradesh', hourlyRate: 340, tier: 'tier2' },
    { city: 'Nashik', state: 'Maharashtra', hourlyRate: 380, tier: 'tier2' },
    { city: 'Rajkot', state: 'Gujarat', hourlyRate: 350, tier: 'tier2' },
    { city: 'Madurai', state: 'Tamil Nadu', hourlyRate: 340, tier: 'tier2' },
    { city: 'Varanasi', state: 'Uttar Pradesh', hourlyRate: 320, tier: 'tier2' },

    // Tier 3 cities
    { city: 'Mysore', state: 'Karnataka', hourlyRate: 300, tier: 'tier3' },
    { city: 'Mangalore', state: 'Karnataka', hourlyRate: 320, tier: 'tier3' },
    { city: 'Jodhpur', state: 'Rajasthan', hourlyRate: 280, tier: 'tier3' },
    { city: 'Udaipur', state: 'Rajasthan', hourlyRate: 290, tier: 'tier3' },
    { city: 'Allahabad', state: 'Uttar Pradesh', hourlyRate: 260, tier: 'tier3' },
    { city: 'Prayagraj', state: 'Uttar Pradesh', hourlyRate: 260, tier: 'tier3' },
    { city: 'Aurangabad', state: 'Maharashtra', hourlyRate: 300, tier: 'tier3' },
    { city: 'Amritsar', state: 'Punjab', hourlyRate: 310, tier: 'tier3' },
    { city: 'Guwahati', state: 'Assam', hourlyRate: 280, tier: 'tier3' },
    { city: 'Dehradun', state: 'Uttarakhand', hourlyRate: 300, tier: 'tier3' }
];

/**
 * Seed data for car parts - Prices in INR
 */
const partPricesData = [
    // Body panels
    { partName: 'front_bumper', minPrice: 4000, maxPrice: 18000, avgPrice: 10000, category: 'body' },
    { partName: 'rear_bumper', minPrice: 3500, maxPrice: 16000, avgPrice: 9000, category: 'body' },
    { partName: 'bumper', minPrice: 3000, maxPrice: 15000, avgPrice: 8000, category: 'body' },
    { partName: 'front_fender', minPrice: 3000, maxPrice: 14000, avgPrice: 7000, category: 'body' },
    { partName: 'rear_fender', minPrice: 2500, maxPrice: 12000, avgPrice: 6000, category: 'body' },
    { partName: 'fender', minPrice: 2500, maxPrice: 12000, avgPrice: 6000, category: 'body' },
    { partName: 'front_door', minPrice: 10000, maxPrice: 40000, avgPrice: 22000, category: 'body' },
    { partName: 'rear_door', minPrice: 8000, maxPrice: 35000, avgPrice: 18000, category: 'body' },
    { partName: 'door', minPrice: 8000, maxPrice: 35000, avgPrice: 18000, category: 'body' },
    { partName: 'hood', minPrice: 6000, maxPrice: 25000, avgPrice: 14000, category: 'body' },
    { partName: 'bonnet', minPrice: 6000, maxPrice: 25000, avgPrice: 14000, category: 'body' },
    { partName: 'trunk', minPrice: 5000, maxPrice: 22000, avgPrice: 12000, category: 'body' },
    { partName: 'trunk_lid', minPrice: 5000, maxPrice: 22000, avgPrice: 12000, category: 'body' },
    { partName: 'decklid', minPrice: 5000, maxPrice: 22000, avgPrice: 12000, category: 'body' },
    { partName: 'roof', minPrice: 10000, maxPrice: 40000, avgPrice: 22000, category: 'body' },
    { partName: 'roof_panel', minPrice: 10000, maxPrice: 40000, avgPrice: 22000, category: 'body' },
    { partName: 'quarter_panel', minPrice: 8000, maxPrice: 30000, avgPrice: 16000, category: 'body' },
    { partName: 'rocker_panel', minPrice: 4000, maxPrice: 15000, avgPrice: 8000, category: 'body' },
    { partName: 'side_skirt', minPrice: 3000, maxPrice: 12000, avgPrice: 6000, category: 'body' },

    // Mirrors
    { partName: 'side_mirror', minPrice: 1500, maxPrice: 8000, avgPrice: 4000, category: 'body' },
    { partName: 'left_mirror', minPrice: 1500, maxPrice: 8000, avgPrice: 4000, category: 'body' },
    { partName: 'right_mirror', minPrice: 1500, maxPrice: 8000, avgPrice: 4000, category: 'body' },
    { partName: 'rearview_mirror', minPrice: 800, maxPrice: 3000, avgPrice: 1500, category: 'body' },

    // Lights
    { partName: 'headlight', minPrice: 3000, maxPrice: 20000, avgPrice: 10000, category: 'lights' },
    { partName: 'headlamp', minPrice: 3000, maxPrice: 20000, avgPrice: 10000, category: 'lights' },
    { partName: 'taillight', minPrice: 2000, maxPrice: 12000, avgPrice: 6000, category: 'lights' },
    { partName: 'tail_lamp', minPrice: 2000, maxPrice: 12000, avgPrice: 6000, category: 'lights' },
    { partName: 'fog_light', minPrice: 1500, maxPrice: 6000, avgPrice: 3000, category: 'lights' },
    { partName: 'turn_signal', minPrice: 500, maxPrice: 2500, avgPrice: 1200, category: 'lights' },
    { partName: 'drl', minPrice: 1000, maxPrice: 5000, avgPrice: 2500, category: 'lights' },

    // Glass
    { partName: 'windshield', minPrice: 5000, maxPrice: 25000, avgPrice: 12000, category: 'glass' },
    { partName: 'front_windshield', minPrice: 5000, maxPrice: 25000, avgPrice: 12000, category: 'glass' },
    { partName: 'rear_windshield', minPrice: 4000, maxPrice: 18000, avgPrice: 10000, category: 'glass' },
    { partName: 'window', minPrice: 2000, maxPrice: 10000, avgPrice: 5000, category: 'glass' },
    { partName: 'door_window', minPrice: 2000, maxPrice: 10000, avgPrice: 5000, category: 'glass' },
    { partName: 'quarter_glass', minPrice: 1500, maxPrice: 6000, avgPrice: 3000, category: 'glass' },

    // Grille and front accessories
    { partName: 'grille', minPrice: 2000, maxPrice: 15000, avgPrice: 7000, category: 'body' },
    { partName: 'front_grille', minPrice: 2000, maxPrice: 15000, avgPrice: 7000, category: 'body' },
    { partName: 'radiator_grille', minPrice: 2000, maxPrice: 15000, avgPrice: 7000, category: 'body' },
    { partName: 'bumper_cover', minPrice: 2500, maxPrice: 12000, avgPrice: 6000, category: 'body' },
    { partName: 'splash_guard', minPrice: 500, maxPrice: 2000, avgPrice: 1000, category: 'body' },
    { partName: 'mud_flap', minPrice: 300, maxPrice: 1500, avgPrice: 700, category: 'body' },

    // Damage types (when part is not detected)
    { partName: 'scratch', minPrice: 1000, maxPrice: 5000, avgPrice: 2500, category: 'damage' },
    { partName: 'dent', minPrice: 2000, maxPrice: 8000, avgPrice: 4000, category: 'damage' },
    { partName: 'crack', minPrice: 1500, maxPrice: 6000, avgPrice: 3000, category: 'damage' },
    { partName: 'paint_damage', minPrice: 1500, maxPrice: 8000, avgPrice: 4000, category: 'damage' },
    { partName: 'rust', minPrice: 2000, maxPrice: 10000, avgPrice: 5000, category: 'damage' },
    { partName: 'broken', minPrice: 3000, maxPrice: 15000, avgPrice: 8000, category: 'damage' },

    // Default fallback
    { partName: 'vehicle_part', minPrice: 2000, maxPrice: 10000, avgPrice: 5000, category: 'body' },
    { partName: 'default', minPrice: 2000, maxPrice: 10000, avgPrice: 5000, category: 'body' }
];

async function main() {
    console.log('🌱 Starting database seeding...');

    // Seed Labor Costs
    console.log('📍 Seeding labor costs for Indian cities...');
    for (const data of laborCostsData) {
        await prisma.laborCost.upsert({
            where: { city: data.city },
            update: data,
            create: data
        });
    }
    console.log(`✅ Added ${laborCostsData.length} cities with labor rates`);

    // Seed Part Prices
    console.log('🔧 Seeding part prices...');
    for (const data of partPricesData) {
        await prisma.partPrice.upsert({
            where: { partName: data.partName },
            update: data,
            create: data
        });
    }
    console.log(`✅ Added ${partPricesData.length} part prices`);

    console.log('🎉 Database seeding completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
