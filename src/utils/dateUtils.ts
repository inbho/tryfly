/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a time string to a human-readable format
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate the time difference between two dates in minutes
 */
export const getTimeDifferenceInMinutes = (date1: string, date2: string): number => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  return Math.abs(Math.floor((d2 - d1) / (1000 * 60)));
};

/**
 * Format minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins}m`;
};

/**
 * Check if a flight is delayed
 */
export const isFlightDelayed = (scheduledTime: string, estimatedTime: string): boolean => {
  const scheduled = new Date(scheduledTime).getTime();
  const estimated = new Date(estimatedTime).getTime();
  
  // If estimated time is more than 15 minutes after scheduled time
  return estimated - scheduled > 15 * 60 * 1000;
};

/**
 * Get relative time (e.g., "in 2 hours", "30 minutes ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diffInMinutes = Math.floor((date - now) / (1000 * 60));
  
  if (diffInMinutes < 0) {
    // Past
    const absMinutes = Math.abs(diffInMinutes);
    
    if (absMinutes < 60) {
      return `${absMinutes}m ago`;
    } else if (absMinutes < 1440) {
      return `${Math.floor(absMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(absMinutes / 1440)}d ago`;
    }
  } else {
    // Future
    if (diffInMinutes < 60) {
      return `in ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `in ${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `in ${Math.floor(diffInMinutes / 1440)}d`;
    }
  }
};