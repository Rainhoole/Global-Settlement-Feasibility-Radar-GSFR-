import { useEffect, useRef, useState } from 'react';
import { countries } from '../data';
import type { CountryData } from '../types/country';
import { flagEmoji, openfxBadgeColor, openfxLabel } from '../utils';

interface SearchModalProps {
  onSelect: (country: CountryData) => void;
  onClose: () => void;
}

export function SearchModal({ onSelect, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = query.trim()
    ? countries.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.name_zh.includes(q) ||
          c.code.toLowerCase().includes(q)
        );
      })
    : countries.slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-[fadeIn_200ms_ease-out]"
        style={{ backgroundColor: '#1e293b' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#334155]">
          <span className="text-[#94a3b8]">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索国家..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#f8fafc] placeholder-[#64748b] outline-none border-none"
          />
          <kbd className="text-[10px] text-[#64748b] border border-[#334155] rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.map((country) => (
            <button
              key={country.code}
              onClick={() => { onSelect(country); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#334155] cursor-pointer bg-transparent border-none"
            >
              <span className="text-lg">{flagEmoji(country.code)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#f8fafc] truncate">{country.name}</div>
                <div className="text-xs text-[#94a3b8]">{country.name_zh}</div>
              </div>
              <span
                className="text-sm font-bold shrink-0"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' }}
              >
                {country.feasibilityIndex}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                style={{
                  backgroundColor: openfxBadgeColor(country.openfx.status) + '20',
                  color: openfxBadgeColor(country.openfx.status),
                }}
              >
                {openfxLabel(country.openfx.status)}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[#64748b]">没有匹配的国家</div>
          )}
        </div>
      </div>
    </div>
  );
}
