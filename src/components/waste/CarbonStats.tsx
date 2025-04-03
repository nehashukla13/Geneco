import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CarbonFootprint } from './CarbonFootprint';
import { Leaderboard } from './Leaderboard';

interface CarbonData {
  date: string;
  impact: number;
}

export function CarbonStats() {
  const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
  const [totalImpact, setTotalImpact] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCarbonData() {
      try {
        // Fetch carbon footprint data
        const { data: footprints, error: footprintError } = await supabase
          .from('carbon_footprints')
          .select(`
            carbon_impact,
            created_at,
            reduction_suggestions
          `)
          .order('created_at', { ascending: true });

        if (footprintError) throw footprintError;

        // Transform data for the chart
        const chartData = footprints?.map(f => ({
          date: f.created_at,
          impact: Number(f.carbon_impact)
        })) || [];

        // Calculate total impact
        const total = footprints?.reduce((sum, f) => sum + Number(f.carbon_impact), 0) || 0;

        // Collect unique suggestions
        const allSuggestions = footprints?.reduce((acc, f) => [...acc, ...f.reduction_suggestions], [] as string[]);
        const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);

        setCarbonData(chartData);
        setTotalImpact(total);
        setSuggestions(uniqueSuggestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load carbon data');
      } finally {
        setLoading(false);
      }
    }

    fetchCarbonData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading carbon data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CarbonFootprint
        data={carbonData}
        totalImpact={totalImpact}
        suggestions={suggestions}
      />
      <Leaderboard />
    </div>
  );
}