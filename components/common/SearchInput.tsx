"use client";

import React, { InputHTMLAttributes } from 'react';

import {
  Loader2,
  Search,
  X,
} from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearchChange: (value: string) => void;
  debounceTimeout?: number;
  isLoading?: boolean;
}

export function SearchInput({
  onSearchChange,
  debounceTimeout = 300,
  isLoading = false,
  ...props
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearchChange(value);
    }, debounceTimeout);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading}
        {...props}
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
      ) : (
        searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-full flex items-center justify-center hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )
      )}
    </div>
  );
}
