import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { classifyWasteImage } from '@/lib/gemini';
import { useAuth } from '@/contexts/AuthContext';
import { calculateCarbonFootprint } from '@/lib/carbon';
import { awardPoints } from '@/lib/gamification';

export function ImageUpload() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('waste-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('waste-images')
        .getPublicUrl(filePath);

      // 3. Classify the image using Gemini
      const classification = await classifyWasteImage(publicUrl);

      // 4. Calculate carbon footprint
      const carbonFootprint = await calculateCarbonFootprint(classification.classification);

      // 5. Store the report in the database
      const { data: report, error: dbError } = await supabase
        .from('waste_reports')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          classification: classification.classification,
          confidence_score: classification.confidence,
          recommendations: classification.recommendations,
          status: 'completed',
          carbon_footprint: carbonFootprint.impact
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 6. Store carbon footprint data
      await supabase
        .from('carbon_footprints')
        .insert({
          user_id: user.id,
          waste_report_id: report.id,
          carbon_impact: carbonFootprint.impact,
          reduction_suggestions: carbonFootprint.suggestions
        });

      // 7. Award points for the submission
      await awardPoints(user.id, 'waste_report', report.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: loading
  });

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
          )}
          
          <div className="text-center">
            <p className="text-base font-medium text-gray-900">
              {loading ? 'Analyzing waste...' : 'Upload waste image'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag and drop an image, or click to select'}
            </p>
          </div>

          {!isDragActive && !loading && (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
            >
              Select Image
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Supported formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}