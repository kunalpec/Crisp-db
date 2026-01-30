/**
 * Room Management Utilities
 * 
 * Room naming conventions:
 * - Company Room: company_<companyId>
 * - Visitor Room: visitor_<visitorSessionId>
 */

/**
 * Generate company room ID
 * @param {string|ObjectId} companyId - Company MongoDB ObjectId
 * @returns {string} Room ID in format: company_<companyId>
 */
export const getCompanyRoomId = (companyId) => {
  return `company_${companyId}`;
};

/**
 * Generate visitor room ID
 * @param {string} visitorSessionId - Unique visitor session ID
 * @returns {string} Room ID in format: visitor_<visitorSessionId>
 */
export const getVisitorRoomId = (visitorSessionId) => {
  return `visitor_${visitorSessionId}`;
};

/**
 * Extract company ID from company room ID
 * @param {string} roomId - Room ID in format: company_<companyId>
 * @returns {string|null} Company ID or null if invalid format
 */
export const extractCompanyIdFromRoom = (roomId) => {
  if (!roomId || !roomId.startsWith('company_')) {
    return null;
  }
  return roomId.replace('company_', '');
};

/**
 * Extract visitor session ID from visitor room ID
 * @param {string} roomId - Room ID in format: visitor_<visitorSessionId>
 * @returns {string|null} Visitor session ID or null if invalid format
 */
export const extractVisitorSessionIdFromRoom = (roomId) => {
  if (!roomId || !roomId.startsWith('visitor_')) {
    return null;
  }
  return roomId.replace('visitor_', '');
};

/**
 * Check if room ID is a company room
 * @param {string} roomId - Room ID to check
 * @returns {boolean} True if it's a company room
 */
export const isCompanyRoom = (roomId) => {
  return roomId && roomId.startsWith('company_');
};

/**
 * Check if room ID is a visitor room
 * @param {string} roomId - Room ID to check
 * @returns {boolean} True if it's a visitor room
 */
export const isVisitorRoom = (roomId) => {
  return roomId && roomId.startsWith('visitor_');
};
