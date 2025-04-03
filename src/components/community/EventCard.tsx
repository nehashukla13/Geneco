import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  max_participants: number;
  current_participants: number;
  user_id: string;
}

interface EventCardProps {
  event: Event;
  onUpdate: () => void;
  currentUserId?: string;
}

export function EventCard({ event, onUpdate, currentUserId }: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: currentUserId
        });

      if (error) throw error;
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.current_participants >= event.max_participants;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <Users className="h-5 w-5 mr-2" />
            <span>{event.current_participants} / {event.max_participants} participants</span>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        <Button
          onClick={handleJoin}
          disabled={loading || isFull || isPast || event.user_id === currentUserId}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : event.user_id === currentUserId ? (
            'Your Event'
          ) : isPast ? (
            'Event Ended'
          ) : isFull ? (
            'Event Full'
          ) : (
            'Join Event'
          )}
        </Button>
      </div>
    </div>
  );
}