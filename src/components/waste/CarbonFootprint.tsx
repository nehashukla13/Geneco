import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf } from 'lucide-react';

interface CarbonFootprintProps {
  data: {
    date: string;
    impact: number;
  }[];
  totalImpact: number;
  suggestions: string[];
}

export function CarbonFootprint({ data, totalImpact, suggestions }: CarbonFootprintProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
          <Leaf className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Carbon Footprint Tracker</h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <p className="text-sm text-gray-600">Total Carbon Impact</p>
          <p className="text-2xl font-bold text-gray-900">{totalImpact.toFixed(2)} kg CO₂e</p>
        </div>
        
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`${Number(value).toFixed(2)} kg CO₂e`, 'Impact']}
              />
              <Line 
                type="monotone" 
                dataKey="impact" 
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ fill: '#16a34a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Reduction Suggestions
          </h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-green-700">
                <span className="mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}