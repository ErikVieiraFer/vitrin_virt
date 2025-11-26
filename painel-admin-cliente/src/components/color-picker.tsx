'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  id?: string;
}

export function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded-md border border-input cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
        <div
          className="h-10 w-10 rounded-md border border-input"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
