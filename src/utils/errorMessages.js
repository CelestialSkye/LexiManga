/**
 * Translate Firebase error codes into user-friendly messages
 */
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use':
      'This email is already registered. Please sign in or use a different email.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many login attempts. Please try again later.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  };

  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

/**
 * Extract error code from Firebase error message
 */
export const extractErrorCode = (errorMessage) => {
  const match = errorMessage.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
};
