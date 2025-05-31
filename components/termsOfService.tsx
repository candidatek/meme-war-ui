"use client";

import { useFirstVisitModal } from "@/app/hooks/useFirstVisitModal";
import ToastStyleModal from "@/components/ui/modal";


const STORAGE_KEY = "has-seen-pump-intro-modal";

export default function TermsOfServiceModal() {
  const {
    isOpen,
    isInitialized,
    closeModalPermanently,
  } = useFirstVisitModal(STORAGE_KEY, true);

  if (!isInitialized) return null;


  if (!isInitialized) return null;

  return (
    <ToastStyleModal
      isOpen={isOpen}
      onClose={closeModalPermanently}
      width={500}
      height="auto"
      position="center"
    >
      <div className="text-center text-sm sm:text-base text-white">
        <h2 className="text-2xl font-bold mb-5">how it works</h2>

        <p className="leading-relaxed">
          pump allows <span className="text-green-500">anyone</span> to
          create coins. all coins created on Pump are
          <br />
          <span className="text-green-500">fair-launch</span>, meaning
          everyone has equal access to buy and sell
          <br />
          when the coin is first created.
        </p>

        <div className="my-6 space-y-2 text-left">
          <p>
            <strong>step 1:</strong> pick a coin that you like
          </p>
          <p>
            <strong>step 2:</strong> buy the coin on the bonding curve
          </p>
          <p>
            <strong>step 3:</strong> sell at any time to lock in your
            profits or losses
          </p>
        </div>

        <p className="text-sm">
          by clicking this button you agree to the terms and conditions and
          <br />
          certify that you are over 18 years old
        </p>

        <button
          onClick={closeModalPermanently}
          className="mt-5 mb-4 w-full bg-green-300 text-black font-bold py-2 rounded hover:bg-green-400 transition-colors"
        >
          I&apos m ready to pump
        </button>

        <div className="text-xs text-muted-foreground flex justify-center gap-4">
          <a href="#" className="hover:text-white">privacy policy</a>
          <span>|</span>
          <a href="#" className="hover:text-white">terms of service</a>
          <span>|</span>
          <a href="#" className="hover:text-white">fees</a>
        </div>
      </div>
    </ToastStyleModal>
  );
}