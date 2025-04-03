import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClassificationResult } from './ClassificationResult';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface WasteReport {
  id: string;
  image_url: string;
  classification: string;
  confidence_score: number;
  recommendations: string[];
  created_at: string;
}

export function WasteHistory() {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from('waste_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waste reports');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reportId: string) {
    try {
      setDeleting(reportId);
      const { error } = await supabase
        .from('waste_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      // Update the local state to remove the deleted report
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No waste reports yet. Start by uploading an image!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex">
            <div className="w-1/3">
              <img
                src={report.image_url}
                alt={`Waste classification: ${report.classification}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-2/3 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <ClassificationResult
                    classification={report.classification}
                    confidence={report.confidence_score}
                    recommendations={report.recommendations}
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Reported on: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(report.id)}
                  disabled={deleting === report.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}