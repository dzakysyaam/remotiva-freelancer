import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={selectorRef}>
      <button
        className="language-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={14} />
        <span>{currentLanguage?.label || 'Bahasa Indonesia'}</span>
        <ChevronDown size={12} className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <div className="language-selector__menu" role="listbox">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`language-selector__option ${language === lang.code ? 'is-active' : ''}`}
              onClick={() => handleSelect(lang.code)}
              role="option"
              aria-selected={language === lang.code}
            >
              <span>{lang.label}</span>
              {language === lang.code && <Check size={14} />}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .language-selector {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .language-selector__button {
          border: 0;
          background: transparent;
          color: #64748B;
          font: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .language-selector__button:hover {
          color: #2D76FF;
          background: rgba(45, 118, 255, 0.05);
        }

        .language-selector__button svg:last-child {
          transition: transform 0.2s;
        }

        .language-selector__button .rotated {
          transform: rotate(180deg);
        }

        .language-selector__menu {
          position: absolute;
          right: 0;
          bottom: calc(100% + 10px);
          min-width: 190px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.14);
          padding: 8px;
          z-index: 50;
          animation: fadeIn 0.15s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .language-selector__option {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          color: #111827;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.15s;
        }

        .language-selector__option:hover {
          background: rgba(45, 118, 255, 0.10);
          color: #2D76FF;
        }

        .language-selector__option.is-active {
          background: rgba(45, 118, 255, 0.10);
          color: #2D76FF;
          font-weight: 600;
        }

        .language-selector__option svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
