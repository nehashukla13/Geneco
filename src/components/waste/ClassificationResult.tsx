import React from 'react';
import { AlertTriangle, Leaf, Factory, Recycle, Trash2 } from 'lucide-react';

interface ClassificationResultProps {
  classification: string;
  confidence: number;
  recommendations: string[];
}

const categoryIcons = {
  'Recyclable': { icon: Recycle, color: 'text-blue-500', bg: 'bg-blue-100' },
  'Hazardous': { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  'Organic': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-100' },
  'Non-Recyclable': { icon: Trash2, color: 'text-gray-500', bg: 'bg-gray-100' },
  'Industrial': { icon: Factory, color: 'text-purple-500', bg: 'bg-purple-100' }
};

export function ClassificationResult({ 
  classification, 
  confidence, 
  recommendations 
}: ClassificationResultProps) {
  const categoryInfo = categoryIcons[classification as keyof typeof categoryIcons] || categoryIcons['Non-Recyclable'];
  const Icon = categoryInfo.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className={`h-12 w-12 rounded-full ${categoryInfo.bg} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${categoryInfo.color}`} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{classification}</h3>
          <p className="text-sm text-gray-500">
            Confidence: {(confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
              <span className="text-green-500 mt-1">•</span>
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}