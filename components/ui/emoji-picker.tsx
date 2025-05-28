"use client"

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const commonEmojis = ["💰", "🚀", "🌙", "💎", "🐶", "🐱", "🐸", "🦊", "🐼", "🦁", "🐯", "🎮", "🎲"]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[40px] p-0">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="grid grid-cols-6 gap-2">
          {commonEmojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onChange(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 