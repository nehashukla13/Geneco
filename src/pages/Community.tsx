import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Users, ThumbsUp, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventForm } from '@/components/community/EventForm';
import { ComplaintForm } from '@/components/community/ComplaintForm';
import { EventCard } from '@/components/community/EventCard';
import { ComplaintCard } from '@/components/community/ComplaintCard';

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
}

export function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'complaints'>('events');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchComplaints();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  async function fetchComplaints() {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('upvotes', { ascending: false });
      
      if (error) throw error;
      setComplaints(data || []);
    } finally {
      setLoading(false);
    }
  }

  const handleEventCreated = () => {
    setShowEventForm(false);
    fetchEvents();
  };

  const handleComplaintCreated = () => {
    setShowComplaintForm(false);
    fetchComplaints();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join eco-friendly events and help improve waste management in your community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            variant={activeTab === 'events' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('events')}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-5 w-5" />
            <span>Events</span>
          </Button>
          <Button
            variant={activeTab === 'complaints' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('complaints')}
            className="flex items-center space-x-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Complaints</span>
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => activeTab === 'events' ? setShowEventForm(true) : setShowComplaintForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>{activeTab === 'events' ? 'Create Event' : 'Report Issue'}</span>
            </Button>
          </div>

          {/* Events List */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onUpdate={fetchEvents}
                  currentUserId={user?.id}
                />
              ))}
              {events.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No events scheduled yet</p>
                </div>
              )}
            </div>
          )}

          {/* Complaints List */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onUpdate={fetchComplaints}
                  currentUserId={user?.id}
                />
              ))}
              {complaints.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No complaints reported yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showEventForm && (
        <EventForm
          onClose={() => setShowEventForm(false)}
          onEventCreated={handleEventCreated}
        />
      )}
      {showComplaintForm && (
        <ComplaintForm
          onClose={() => setShowComplaintForm(false)}
          onComplaintCreated={handleComplaintCreated}
        />
      )}
    </div>
  );
}