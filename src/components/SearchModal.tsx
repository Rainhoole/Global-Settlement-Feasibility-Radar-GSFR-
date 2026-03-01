import { useEffect, useMemo, useRef, useState } from 'react';
import { countries } from '../data';
import type { CountryData } from '../types/country';
import { flagEmoji, openfxBadgeColor, openfxLabel } from '../utils';
import { useI18n } from '../i18n';

interface SearchModalProps {
  onSelect: (country: CountryData) => void;
  onClose: () => void;
}

export function SearchModal({ onSelect, onClose }: SearchModalProps) {
  const { language, t } = useI18n();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return countries.slice(0, 12);
    }

    const q = query.toLowerCase();
    return countries.filter((country) => {
      return (
        country.name.toLowerCase().includes(q) ||
        country.name_zh.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-head">
          <input
            ref={inputRef}
            type="text"
            placeholder={t('Search by country name / code')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        <div className="search-list">
          {results.map((country) => (
            <button
              key={country.code}
              type="button"
              className="search-item"
              onClick={() => {
                onSelect(country);
                onClose();
              }}
            >
              <span className="search-flag">{flagEmoji(country.code)}</span>

              <span className="search-country">
                <span className="search-country-name">{language === 'zh' ? country.name_zh : country.name}</span>
                <span className="search-country-sub">{language === 'zh' ? country.name : country.name_zh}</span>
              </span>

              <span className="search-index">{country.feasibilityIndex}</span>

              <span
                className="search-openfx"
                style={{
                  backgroundColor: `${openfxBadgeColor(country.openfx.status)}26`,
                  color: openfxBadgeColor(country.openfx.status),
                }}
              >
                {t(openfxLabel(country.openfx.status))}
              </span>
            </button>
          ))}

          {results.length === 0 && <p className="search-empty">{t('No matching countries.')}</p>}
        </div>
      </div>
    </div>
  );
}
