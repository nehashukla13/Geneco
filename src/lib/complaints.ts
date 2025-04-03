import { supabase } from './supabase';

interface AuthorityRedirectResult {
  success?: boolean;
  error?: string;
}

export async function redirectToAuthority(complaintId: string): Promise<AuthorityRedirectResult> {
  try {
    // Get the complaint details
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (fetchError) throw fetchError;
    if (!complaint) throw new Error('Complaint not found');

    // Get user's current location
    const position = await getCurrentPosition();
    const authorityLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };

    // Update complaint with authority notification
    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        authority_notified: true,
        authority_status: 'pending',
        authority_location: authorityLocation,
        authority_updates: ['Complaint forwarded to local waste management authority']
      })
      .eq('id', complaintId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error redirecting to authority:', error);
    return { error: error instanceof Error ? error.message : 'Failed to redirect to authority' };
  }
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}