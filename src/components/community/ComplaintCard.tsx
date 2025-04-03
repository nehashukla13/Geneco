import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { MapPin, ThumbsUp, AlertTriangle, Image as ImageIcon, Loader2, Send } from 'lucide-react';
import { redirectToAuthority } from '@/lib/complaints';

interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  upvotes: number;
  media_urls: string[];
  user_id: string;
  created_at: string;
  authority_notified?: boolean;
  authority_status?: 'pending' | 'in_progress' | 'resolved';
  authority_updates?: string[];
}

interface ComplaintCardProps {
  complaint: Complaint;
  onUpdate: () => void;
  currentUserId?: string;
}

export function ComplaintCard({ complaint, onUpdate, currentUserId }: ComplaintCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(complaint.upvotes);

  // Check if user has already upvoted this complaint
  React.useEffect(() => {
    async function checkUpvoteStatus() {
      if (!currentUserId || !complaint.id) return;

      try {
        const { data } = await supabase
          .from('complaint_upvotes')
          .select('id')
          .eq('complaint_id', complaint.id)
          .eq('user_id', currentUserId);

        setHasUpvoted(data !== null && data.length > 0);
      } catch (err) {
        console.error('Error checking upvote status:', err);
      }
    }

    checkUpvoteStatus();
  }, [complaint.id, currentUserId]);

  // Subscribe to realtime changes
  React.useEffect(() => {
    // Subscribe to complaint_upvotes table for INSERT and DELETE events
    const upvotesChannel = supabase
      .channel('complaint-upvotes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaint_upvotes',
          filter: `complaint_id=eq.${complaint.id}`
        },
        async () => {
          // When an upvote changes, fetch the latest count from complaints table
          const { data } = await supabase
            .from('complaints')
            .select('upvotes')
            .eq('id', complaint.id)
            .single();
          
          if (data) {
            setLocalUpvotes(data.upvotes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(upvotesChannel);
    };
  }, [complaint.id]);

  const handleUpvote = async () => {
    if (!currentUserId || hasUpvoted || loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // Optimistically update the UI
      setHasUpvoted(true);
      setLocalUpvotes(prev => prev + 1);

      const { error: upvoteError } = await supabase
        .from('complaint_upvotes')
        .insert({
          complaint_id: complaint.id,
          user_id: currentUserId
        });

      if (upvoteError) {
        // Revert optimistic update if there's an error
        setHasUpvoted(false);
        setLocalUpvotes(prev => prev - 1);
        throw upvoteError;
      }
    } catch (err) {
      console.error('Upvote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upvote');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToAuthority = async () => {
    if (!complaint.id) return;

    setRedirecting(true);
    setError(null);

    try {
      const result = await redirectToAuthority(complaint.id);
      if (result.error) throw new Error(result.error);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redirect to authority');
    } finally {
      setRedirecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showAuthorityRedirect = localUpvotes >= 15 && !complaint.authority_notified;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {complaint.title}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </span>
              {complaint.authority_notified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Authority Notified
                </span>
              )}
              {complaint.authority_status && complaint.authority_status !== 'pending' && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.authority_status)}`}>
                  Authority: {complaint.authority_status.charAt(0).toUpperCase() + complaint.authority_status.slice(1)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">{localUpvotes}</span>
            <Button
              variant={hasUpvoted ? "primary" : "outline"}
              size="sm"
              onClick={handleUpvote}
              disabled={loading || !currentUserId || hasUpvoted || complaint.user_id === currentUserId}
              className={`${loading ? 'opacity-50' : ''} ${hasUpvoted ? 'bg-green-600 text-white' : ''}`}
              title={
                !currentUserId ? 'Please sign in to upvote' :
                hasUpvoted ? 'Already upvoted' :
                complaint.user_id === currentUserId ? 'Cannot upvote own complaint' :
                'Upvote this complaint'
              }
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {complaint.description}
        </p>

        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{complaint.location}</span>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {showAuthorityRedirect && (
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <p className="text-blue-700 mb-2">
              This complaint has received significant community support. It can now be escalated to local authorities.
            </p>
            <Button
              onClick={handleRedirectToAuthority}
              disabled={redirecting}
              className="w-full"
            >
              {redirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Authority...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Redirect to Authority
                </>
              )}
            </Button>
          </div>
        )}

        {complaint.authority_notified && complaint.authority_updates && complaint.authority_updates.length > 0 && (
          <div className="mt-4 bg-gray-50 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-2">Authority Updates</h4>
            <div className="space-y-2">
              {complaint.authority_updates.map((update, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{update}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {complaint.media_urls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Evidence</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {complaint.media_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(url)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                >
                  {url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMedia(null)}
          >
            <div className="max-w-4xl w-full max-h-[90vh] relative">
              {selectedMedia.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={selectedMedia}
                  alt="Evidence"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia}
                  controls
                  className="w-full h-full"
                />
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}