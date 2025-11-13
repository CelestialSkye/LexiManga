/**
 * Password Strength Validator
 * Enforces strong password requirements for user security
 */

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

/**
 * Validate password strength
 * Returns: { isValid: boolean, errors: string[], strength: 'weak'|'fair'|'good'|'strong' }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  let strengthScore = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 'weak',
    };
  }

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else {
    strengthScore += 2;
  }

  // Check uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    strengthScore += 1;
  }

  // Check lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    strengthScore += 1;
  }

  // Check number
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    strengthScore += 1;
  }

  // Check special character
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !SPECIAL_CHAR_REGEX.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else if (SPECIAL_CHAR_REGEX.test(password)) {
    strengthScore += 1;
  }

  // Determine strength level
  let strength = 'weak';
  if (strengthScore >= 5) strength = 'strong';
  else if (strengthScore >= 4) strength = 'good';
  else if (strengthScore >= 2) strength = 'fair';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: strengthScore,
  };
};

/**
 * Get password strength indicator color
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = {
    weak: '#ef4444', // red
    fair: '#f97316', // orange
    good: '#eab308', // yellow
    strong: '#22c55e', // green
  };
  return colors[strength] || colors.weak;
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength) => {
  const labels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };
  return labels[strength] || 'Weak';
};
