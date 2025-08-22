/**
 * Shared utility for consistent user identification across the application
 * This ensures that like functionality works correctly by using the same
 * user identifier format for both storing likes and checking liked status
 */

/**
 * Generate a consistent user identifier for both authenticated and anonymous users
 * @param {Object} req - Express request object
 * @returns {string} - Consistent user identifier
 */
export const getUserIdentifier = (req) => {
  if (req.user) {
    // For authenticated users, use their user ID
    return req.user.id.toString();
  } else {
    // For anonymous users, create a consistent identifier
    // Get real client IP (handles proxy situations)
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    'unknown';
    
    const userAgent = req.get('User-Agent')?.slice(0, 100) || 'unknown';
    const acceptLanguage = req.get('Accept-Language')?.slice(0, 20) || '';
    
    // Create a consistent identifier for anonymous users
    // Format: anon_[IP]_[base64(userAgent+acceptLanguage)]
    return `anon_${clientIP}_${Buffer.from(userAgent + acceptLanguage).toString('base64').slice(0, 20)}`;
  }
};

/**
 * Check if a user has liked a post based on the likedBy array
 * @param {Array} likedByArray - Array of user IDs who have liked the post
 * @param {Object} req - Express request object
 * @returns {boolean} - True if the user has liked the post
 */
export const hasUserLiked = (likedByArray, req) => {
  if (!Array.isArray(likedByArray) || likedByArray.length === 0) {
    return false;
  }
  
  const userId = getUserIdentifier(req);
  return likedByArray.some(id => id.toString() === userId.toString());
};

/**
 * Get debug information about user identification
 * @param {Object} req - Express request object
 * @returns {Object} - Debug information
 */
export const getUserIdentificationDebug = (req) => {
  const isAuthenticated = !!req.user;
  const userId = getUserIdentifier(req);
  
  if (isAuthenticated) {
    return {
      isAuthenticated: true,
      userId: userId,
      userType: 'authenticated'
    };
  } else {
    const clientIP = req.ip || 'unknown';
    const userAgent = req.get('User-Agent')?.slice(0, 30) || 'unknown';
    
    return {
      isAuthenticated: false,
      userId: userId.slice(0, 30) + '...',
      userType: 'anonymous',
      clientIP,
      userAgent: userAgent + '...'
    };
  }
};
