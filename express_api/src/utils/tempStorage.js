// Temporary storage for password reset requests
// Key: email, Value: { newPassword, timestamp }
const passwordResetRequests = new Map();

// Store password reset request
export const storePasswordResetRequest = (email, newPassword) => {
  passwordResetRequests.set(email, {
    newPassword,
    timestamp: Date.now()
  });
};

// Get password reset request
export const getPasswordResetRequest = (email) => {
  return passwordResetRequests.get(email);
};

// Delete password reset request
export const deletePasswordResetRequest = (email) => {
  passwordResetRequests.delete(email);
};

// Clean up expired requests (older than 10 minutes)
export const cleanupExpiredRequests = () => {
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  for (const [email, data] of passwordResetRequests.entries()) {
    if (data.timestamp < tenMinutesAgo) {
      passwordResetRequests.delete(email);
    }
  }
}; 