'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  icon,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic popover positioning (top/bottom, left/right) to prevent screen clipping
  const [popoverPos, setPopoverPos] = useState<{ openTop: boolean; openRight: boolean }>({
    openTop: false,
    openRight: false,
  });

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Click outside listener to auto-close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calculate dynamic popover placement relative to viewport & update on scroll/resize
  const updatePosition = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = Math.min(options.length * 40 + 16, 224); // max height of 224px
      const dropdownWidth = Math.max(rect.width, 200);

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const openTop = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      const openRight = rect.left + dropdownWidth > viewportWidth - 16;

      setPopoverPos({ openTop, openRight });
    }
  }, [options.length]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, updatePosition]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const pyClass = size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2 px-3.5 text-xs sm:text-sm';
  const defaultBtnClass = `w-full flex items-center justify-between gap-2 bg-charcoal-900/90 border border-white/20 rounded-xl text-white ${pyClass} focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/50 cursor-pointer transition-all duration-200 ${
    isOpen ? 'border-gold-400 shadow-lg shadow-gold-500/10' : 'hover:border-white/40'
  }`;

  const verticalPositionClass = popoverPos.openTop ? 'bottom-full mb-1.5' : 'top-full mt-1.5';
  const horizontalPositionClass = popoverPos.openRight ? 'right-0' : 'left-0';

  return (
    <div className={`relative w-full text-left select-none ${className}`} ref={containerRef}>
      {/* Select Trigger Button (Matching Luxury Dark & Gold Theme) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`${buttonClassName || defaultBtnClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-gold-400/80 flex-shrink-0">{icon}</span>}
          <span className={`truncate font-semibold ${selectedOption ? 'text-white' : 'text-white/40'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gold-400/80 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-gold-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popup (Custom Select2 Style) */}
      {isOpen && (
        <div
          className={`absolute ${verticalPositionClass} ${horizontalPositionClass} z-[120] min-w-full bg-charcoal-900/95 backdrop-blur-xl border border-gold-500/30 rounded-xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          <div className="max-h-56 overflow-y-auto custom-scrollbar py-1">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (!opt.disabled) handleSelect(opt.value);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm cursor-pointer transition-colors duration-150 ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed text-white/40'
                      : isSelected
                      ? 'bg-gold-500/20 text-gold-300 font-bold border-l-4 border-gold-400 pl-3'
                      : 'text-white/80 hover:bg-gold-500/15 hover:text-gold-200'
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && <span className="text-[10px] text-white/40 font-normal">{opt.sublabel}</span>}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 ms-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

