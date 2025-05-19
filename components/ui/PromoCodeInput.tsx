import React, { useState } from 'react';
import { Input } from "./input";
import { Button } from "./button";
import { X } from "lucide-react";

interface PromoCodeInputProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isValidating: boolean;
  validationError: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  isOpen,
  onClose,
  promoCode,
  setPromoCode,
  onSubmit,
  isValidating,
  validationError
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-xl border-2 border-green-400/50 bg-black/80 p-6 shadow-lg shadow-green-400/20">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-6">
            <div className="inline-block p-3 rounded-full bg-green-500/10 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-green-400"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Enter Promo Code</h2>
            <p className="text-gray-400 text-sm mt-1">Please enter a valid access code to start a war</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter your access code"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                autoFocus
              />
              
              {validationError && (
                <p className="text-red-400 text-sm mt-2 animate-in fade-in duration-300">
                  Invalid access code. Please try again.
                </p>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  setPromoCode("");
                }}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isValidating || !promoCode}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
              >
                {isValidating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating
                  </span>
                ) : "Apply Code"}
              </Button>
            </div>
          </form>

          <div className="pt-4 mt-6 border-t border-gray-800">
            <p className="text-center text-xs text-gray-500">
              Need an access code? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeInput; 