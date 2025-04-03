import { supabase } from './supabase';

const POINTS_SYSTEM = {
  waste_report: 100,
  eco_event: 500,
  verified_implementation: 300,
  complaint_upvote: 50
};

const LEVEL_THRESHOLDS = [
  0,      // Level 1
  1000,   // Level 2
  2500,   // Level 3
  5000,   // Level 4
  10000,  // Level 5
  20000,  // Level 6
  35000,  // Level 7
  50000,  // Level 8
  75000,  // Level 9
  100000  // Level 10
];

function calculateLevel(points: number): number {
  return LEVEL_THRESHOLDS.findIndex(threshold => points < threshold) || LEVEL_THRESHOLDS.length;
}

export async function awardPoints(
  userId: string,
  action: keyof typeof POINTS_SYSTEM,
  referenceId: string
) {
  const points = POINTS_SYSTEM[action];

  // Get current points, if no record exists it will be created by the trigger
  const { data: userPoints, error: fetchError } = await supabase
    .from('user_points')
    .select('points')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const currentPoints = userPoints?.points || 0;
  const newPoints = currentPoints + points;
  const newLevel = calculateLevel(newPoints);

  // Update points
  const { error: updateError } = await supabase
    .from('user_points')
    .upsert({
      user_id: userId,
      points: newPoints,
      level: newLevel,
      updated_at: new Date().toISOString()
    });

  if (updateError) throw updateError;

  // Record the transaction
  const { error: transactionError } = await supabase
    .from('point_transactions')
    .insert({
      user_id: userId,
      points,
      reason: `${action}: ${referenceId}`
    });

  if (transactionError) throw transactionError;

  return { points: newPoints, level: newLevel };
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('user_points')
    .select(`
      user_id,
      points,
      level,
      user:users!user_points_user_id_fkey (
        email
      )
    `)
    .order('points', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}