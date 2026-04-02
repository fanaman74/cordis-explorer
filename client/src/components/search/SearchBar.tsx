import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(newValue: string) {
    setLocalValue(newValue);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      onChange(localValue);
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
      }}
    >
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: '#6a6a6a' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search EU research projects…"
        className="w-full pl-12 pr-5 py-4 text-base outline-none border-0"
        style={{
          background: '#ffffff',
          color: '#222222',
          fontFamily: 'inherit',
          fontWeight: 500,
        }}
      />
    </div>
  );
}
