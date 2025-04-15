// toast-utils.js or toast-utils.ts
import { toast } from "sonner";

// Base style for all toasts
const baseToastStyle = {
  padding: "20px",
  fontSize: "40px",
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  background: 'rgba(0, 0, 0, 0.7)'
};

// Success toast style (green)
const successStyle = {
  ...baseToastStyle,
  border: '5px solid rgba(76, 175, 80, 0.7)',
  boxShadow: '0 0 15px rgba(76, 175, 80, 0.7)'
};

// Error toast style (red)
const errorStyle = {
  ...baseToastStyle,
  border: '5px solid rgba(255, 0, 0, 0.7)',
  boxShadow: '0 0 15px rgba(255, 0, 0, 0.7)'
};

// Info toast style (blue)
const infoStyle = {
  ...baseToastStyle,
  border: '5px solid rgba(33, 150, 243, 0.7)',
  boxShadow: '0 0 15px rgba(33, 150, 243, 0.7)'
};

// Warning toast style (yellow/orange)
const warningStyle = {
  ...baseToastStyle,
  border: '5px solid rgba(255, 152, 0, 0.7)',
  boxShadow: '0 0 15px rgba(255, 152, 0, 0.7)'
};

/**
 * Show a success toast with styled appearance
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showSuccessToast = (message: string, options = {}) => {
  toast.success(message, {
    style: successStyle,
    ...options
  });
};

/**
 * Show an error toast with styled appearance
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showErrorToast = (message: string, options = {}) => {
  toast.error(message, {
    style: errorStyle,
    ...options
  });
};

/**
 * Show an info toast with styled appearance
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showInfoToast = (message: string, options = {}) => {
  toast(message, {
    style: infoStyle,
    ...options
  });
};

/**
 * Show a warning toast with styled appearance
 * @param {string} message - The message to display
 * @param {Object} options - Additional toast options
 */
export const showWarningToast = (message: string, options = {}) => {
  toast.warning(message, {
    style: warningStyle,
    ...options
  });
};

/**
 * Show a custom styled toast
 * @param {string} message - The message to display
 * @param {string} borderColor - Border color in rgba format
 * @param {string} glowColor - Box shadow color in rgba format
 * @param {Object} options - Additional toast options
 */
export const showCustomToast = (message: string, borderColor: string, glowColor: string, options = {}) => {
  toast(message, {
    style: {
      ...baseToastStyle,
      border: `5px solid ${borderColor}`,
      boxShadow: `0 0 15px ${glowColor}`
    },
    ...options
  });
};

// Export all the styles for direct use if needed
export const toastStyles = {
  base: baseToastStyle,
  success: successStyle,
  error: errorStyle,
  info: infoStyle,
  warning: warningStyle
};