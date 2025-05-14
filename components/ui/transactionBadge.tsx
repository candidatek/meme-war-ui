// TransactionBadge.tsx
// Place this in your components folder (e.g., @/components/ui/TransactionBadge.tsx)

import React from 'react';

// Configuration object for transaction types and their styles
const transactionTypes = {
  // Deposit transaction types
  deposit: {
    label: "Deposit",
    className: "bg-emerald-50 text-emerald-700", // Light green background with dark green text
  },
  winning: {
    label: "Winnings",
    className: "bg-primary text-primary-foreground",
  },
  rfdeposit: {
    label: "Rfdeposit",
    className: "bg-emerald-50 text-emerald-700", // Same color as regular deposit
  },
  riskfree: {
    label: "Riskfree",
    className: "bg-emerald-50 text-emerald-700",
  },
  endwar: {
    label: "Endwar",
    className: "bg-muted text-muted-foreground",
  },
  
  // Withdraw transaction types
  withdraw: {
    label: "Withdraw",
    className: "bg-red-50 text-red-800", // Light red background with dark red text
  },
  
  // Default/fallback for unknown types
  default: {
    label: "Transaction", 
    className: "bg-muted text-muted-foreground",
  }
};

interface TransactionBadgeProps {
  type: string;        // Transaction type (e.g., "deposit", "withdraw")
  className?: string;  // Additional class names
  label?: string;      // Optional custom label (overrides default)
}

/**
 * A reusable transaction badge component
 */
export function TransactionBadge({ type, className = "", label }: TransactionBadgeProps) {
  // Get the transaction style based on the type (case-insensitive)
  const getTransactionStyle = (eventType: string) => {
    const normalizedType = eventType.toLowerCase();
    
    if (normalizedType.includes('rfdeposit') || normalizedType === 'risk-free deposit') {
      return transactionTypes.rfdeposit;
    }
    
    if (normalizedType.includes('deposit')) {
      return transactionTypes.deposit;
    }
    
    if (normalizedType.includes('withdraw')) {
      return transactionTypes.withdraw;
    }

    if(normalizedType.includes('riskfree')) {
      return transactionTypes.riskfree;
    }

    if(normalizedType.includes('endwar')) {
      return transactionTypes.endwar;
    }

    if(normalizedType.includes('winnings')) {
      return transactionTypes.winning;
    }
    
    return transactionTypes.default;
  };

  const style = getTransactionStyle(type);
  
  // Use provided label or default from style
  const displayLabel = label || style.label;
  
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-sm ${style.className} ${className}`}>
      {displayLabel}
    </span>
  );
}

/**
 * Optional helper method to expose transaction styles without using the component
 */
export function getTransactionBadgeClass(type: string): string {
  const normalizedType = type.toLowerCase();
  
  if (normalizedType.includes('rfdeposit') || normalizedType === 'risk-free deposit') {
    return transactionTypes.rfdeposit.className;
  }
  
  if (normalizedType.includes('deposit')) {
    return transactionTypes.deposit.className;
  }
  
  if (normalizedType.includes('withdraw')) {
    return transactionTypes.withdraw.className;
  }
  
  return transactionTypes.default.className;
}