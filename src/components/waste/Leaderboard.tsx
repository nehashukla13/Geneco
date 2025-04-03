import React, { useEffect, useState } from "react";
import { Trophy, Medal, RefreshCcw, AlertCircle } from "lucide-react";
import { getLeaderboard } from "@/lib/gamification";

interface LeaderboardEntry {
  user_id: string;
  points: number;
  level: number;
  user?: {
    email?: string;
  };
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard();
      console.log("Leaderboard Data:", data); // Debugging

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("No leaderboard data available.");
      }
      setLeaderboard(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Function to extract initials from email
  const getInitials = (email?: string) => {
    if (!email) return "??"; // Default for missing emails
    const name = email.split("@")[0];
    return name
      .split(".")
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong> <span className="block sm:inline">{error}</span>
        <button onClick={fetchLeaderboard} className="ml-4 text-blue-600 hover:underline text-sm">
          <RefreshCcw className="h-4 w-4 inline-block mr-1" />
          Retry
        </button>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <div className="text-center py-8 text-gray-500">No leaderboard data available.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold">Top Eco Warriors</h3>
        </div>

        {/* Refresh Button */}
        <button onClick={fetchLeaderboard} className="flex items-center text-blue-600 hover:underline text-sm">
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center space-x-4 p-4 rounded-lg ${
              index === 0
                ? "bg-yellow-50 border-l-4 border-yellow-500"
                : index === 1
                ? "bg-gray-50 border-l-4 border-gray-400"
                : index === 2
                ? "bg-orange-50 border-l-4 border-orange-500"
                : "bg-white border-l-4 border-gray-200"
            }`}
          >
            <div className="flex-shrink-0 w-8 text-center">
              {index === 0 ? (
                <Medal className="h-6 w-6 text-yellow-500" />
              ) : index === 1 ? (
                <Medal className="h-6 w-6 text-gray-500" />
              ) : index === 2 ? (
                <Medal className="h-6 w-6 text-orange-500" />
              ) : (
                <span className="text-gray-600 font-medium">{index + 1}</span>
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">{getInitials(entry.user?.email)}</p>
              <p className="text-sm text-gray-500">Level {entry.level}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-gray-900">{entry.points.toLocaleString()} pts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
