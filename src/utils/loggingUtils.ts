// Logging utilities for debugging API responses

/**
 * Log API event object with detailed format
 * @param event API Event object
 */
export const logDetailedEvent = (event: any) => {
  if (!event) {
    console.log("Event object is null or undefined");
    return;
  }

  console.log("Event Details:");
  console.log(`- ID: ${event.id}`);
  console.log(`- Title: ${event.title}`);
  console.log(`- Date: ${event.event_date}`);
  
  // Location details
  const latitude = event.location_lat || event.location_latitude;
  const longitude = event.location_long || event.location_longitude;
  console.log(`- Location: ${event.location_name} (${latitude}, ${longitude})`);
  
  // Sport details - handle different formats
  if (event.sport && typeof event.sport === 'object') {
    console.log(`- Sport: ${event.sport.name} (ID: ${event.sport.id})`);
  } else if (event.Sports && typeof event.Sports === 'object') {
    console.log(`- Sport: ${event.Sports.name} (ID: ${event.Sports.id})`);
  } else if (event.sport_name && event.sport_id) {
    console.log(`- Sport: ${event.sport_name} (ID: ${event.sport_id})`);
  } else {
    console.log(`- Sport: Unknown`);
  }
  
  // Creator details
  if (event.creator && typeof event.creator === 'object') {
    console.log(`- Creator: ${event.creator.first_name} ${event.creator.last_name} (ID: ${event.creator.id})`);
  } else if (event.users && typeof event.users === 'object') {
    console.log(`- Creator: ${event.users.first_name} ${event.users.last_name} (ID: ${event.users.id})`);
  } else if (event.creator_name) {
    console.log(`- Creator: ${event.creator_name} (ID: ${event.creator_id})`);
  } else {
    console.log(`- Creator: Unknown`);
  }
  
  // Status and participation
  console.log(`- Status: ${event.status}`);
  console.log(`- Participants: ${event.participant_count || 0}/${event.max_participants || 'Unknown'}`);
  console.log(`- User Joined: ${event.user_joined ? 'Yes' : 'No'}`);
};

/**
 * Check if two events match based on sport ID
 * @param event1 Event object with sport_id or nested sport object
 * @param sportId Sport ID to match
 * @returns true if the event matches the sport ID
 */
export const eventMatchesSportId = (event: any, sportId: number | null): boolean => {
  if (!sportId) return true; // If no sport ID filter, all events match
  
  // Check different possible formats
  if (event.sport_id) {
    return Number(event.sport_id) === sportId;
  } else if (event.sport && typeof event.sport === 'object' && 'id' in event.sport) {
    return Number(event.sport.id) === sportId;
  } else if (event.Sports && typeof event.Sports === 'object' && 'id' in event.Sports) {
    return Number(event.Sports.id) === sportId;
  }
  
  return false; // Default: no match
}; 