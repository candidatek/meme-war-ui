import { useState, useEffect } from 'react';

/**
 * Hook to manage a modal that should only be shown on the first visit
 * @param storageKey The key to use for localStorage (allows having multiple first-time modals)
 * @param initiallyOpen Whether the modal should default to open before checking localStorage
 * @returns Modal state and handlers
 */
export const useFirstVisitModal = (
  storageKey = 'has-seen-intro-modal',
  initiallyOpen = true
) => {
  // Start with modal closed to prevent flash
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check localStorage on component mount (client-side only)
  useEffect(() => {
    // Skip the effect during SSR
    if (typeof window === 'undefined') return;

    // Check if this is the first visit
    const hasSeenModal = localStorage.getItem(storageKey) === 'true';
    
    // Only open the modal if this is the first visit and initiallyOpen is true
    setIsOpen(initiallyOpen && !hasSeenModal);
    setIsInitialized(true);
  }, [storageKey, initiallyOpen]);

  // Close the modal and remember that user has seen it
  const closeModalPermanently = () => {
    setIsOpen(false);
    
    // Remember that user has seen the modal
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
  };

  // Force open the modal (for testing or if user wants to see it again)
  const openModal = () => {
    setIsOpen(true);
  };

  // Standard close without saving to localStorage
  const closeModal = () => {
    setIsOpen(false);
  };

  // Reset the localStorage flag (for testing)
  const resetModalState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  return {
    isOpen,
    isInitialized,
    openModal,
    closeModal,
    closeModalPermanently,
    resetModalState
  };
};