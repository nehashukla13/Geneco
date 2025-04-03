interface CarbonFootprint {
  impact: number;
  suggestions: string[];
}

const CARBON_IMPACT = {
  'Recyclable': 0.5,
  'Hazardous': 2.0,
  'Organic': 0.8,
  'Non-Recyclable': 1.5,
  'Industrial': 3.0
};

const REDUCTION_SUGGESTIONS = {
  'Recyclable': [
    'Clean and separate materials properly before recycling',
    'Choose products with minimal packaging',
    'Reuse containers when possible'
  ],
  'Hazardous': [
    'Use eco-friendly alternatives to hazardous products',
    'Properly dispose of hazardous waste at designated facilities',
    'Reduce usage of products containing harmful chemicals'
  ],
  'Organic': [
    'Start composting at home',
    'Reduce food waste through meal planning',
    'Use organic waste for garden fertilizer'
  ],
  'Non-Recyclable': [
    'Choose recyclable alternatives when available',
    'Avoid single-use products',
    'Support brands that use sustainable packaging'
  ],
  'Industrial': [
    'Implement waste reduction strategies',
    'Choose suppliers with sustainable practices',
    'Invest in recycling equipment'
  ]
};

export async function calculateCarbonFootprint(wasteType: string): Promise<CarbonFootprint> {
  const impact = CARBON_IMPACT[wasteType as keyof typeof CARBON_IMPACT] || 1.0;
  const suggestions = REDUCTION_SUGGESTIONS[wasteType as keyof typeof REDUCTION_SUGGESTIONS] || [];

  return {
    impact,
    suggestions
  };
}