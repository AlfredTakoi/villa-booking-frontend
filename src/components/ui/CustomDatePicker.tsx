'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export interface DailyRateItem {
  is_blocked?: boolean;
  block_reason?: string | null;
  block_type?: 'booking' | 'manual' | null;
  price?: number;
}

export interface CustomDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  minDate?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  dailyRates?: Record<string, DailyRateItem>;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CustomDatePicker({
  value,
  onChange,
  minDate,
  placeholder = 'Pilih Tanggal',
  className = '',
  disabled = false,
  dailyRates,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic popover positioning (top/bottom, left/right) to prevent screen clipping
  const [popoverPos, setPopoverPos] = useState<{ openTop: boolean; openRight: boolean }>({
    openTop: false,
    openRight: false,
  });

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Initial display month based on selected value or minDate or today
  const initialDateObj = useMemo(() => {
    if (value) return new Date(value);
    if (minDate) return new Date(minDate);
    return new Date();
  }, [value, minDate]);

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDateObj);

  // Synchronize when value changes
  useEffect(() => {
    if (value) {
      setCurrentMonthDate(new Date(value));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dynamic popover placement relative to viewport & update on scroll/resize
  const updatePosition = React.useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverHeight = 360;
      const popoverWidth = 290;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const openTop = spaceBelow < popoverHeight && spaceAbove > spaceBelow;
      const openRight = rect.left + popoverWidth > viewportWidth - 16;

      setPopoverPos({ openTop, openRight });
    }
  }, []);

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

  // Format display date (e.g., "17 Sep 2026")
  const formatDisplay = (dStr: string) => {
    if (!dStr) return null;
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const monthName = MONTH_NAMES[monthIdx]?.substring(0, 3) || '';
    return `${day} ${monthName} ${year}`;
  };

  // Build grid for current month
  const calendarGrid = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells: Array<{ day: number | null; dateStr: string | null }> = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr: dStr });
    }
    return { year, month, monthName: MONTH_NAMES[month], cells };
  }, [currentMonthDate]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (dStr: string) => {
    setWarningMsg(null);
    const rateInfo = dailyRates ? dailyRates[dStr] : null;

    if (rateInfo?.is_blocked) {
      const reason = rateInfo.block_reason || 'Sudah dipesan tamu lain / diblokir';
      setWarningMsg(`Tanggal ${formatDisplay(dStr)} tidak dapat dipilih (${reason}).`);
      return;
    }

    onChange(dStr);
    setIsOpen(false);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const verticalPositionClass = popoverPos.openTop ? 'bottom-full mb-2' : 'top-full mt-2';
  const horizontalPositionClass = popoverPos.openRight ? 'right-0' : 'left-0';

  return (
    <div className={`relative w-full text-left select-none ${className}`} ref={containerRef}>
      {/* DatePicker Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setWarningMsg(null);
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center gap-2 bg-transparent text-white text-sm font-semibold focus:outline-none cursor-pointer truncate"
      >
        <CalendarIcon className="w-4 h-4 text-gold-400/80 flex-shrink-0" />
        <span className="truncate text-white">
          {value ? formatDisplay(value) : <span className="text-white/40">{placeholder}</span>}
        </span>
      </button>

      {/* Dynamic Popover (Position adapts to screen bounds) */}
      {isOpen && (
        <div
          className={`absolute ${verticalPositionClass} ${horizontalPositionClass} z-[150] w-72 bg-charcoal-900/95 backdrop-blur-xl border border-gold-500/30 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Warning banner if blocked date clicked */}
          {warningMsg && (
            <div className="mb-2.5 p-2 bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-xl text-[10px] leading-tight flex items-start gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{warningMsg}</span>
            </div>
          )}

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 text-white">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400 font-sans">
              {calendarGrid.monthName} {calendarGrid.year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[10px] font-bold text-white/40">
            {DAY_NAMES.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.cells.map((cell, idx) => {
              if (!cell.dateStr) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const isSelected = cell.dateStr === value;
              const isPast = minDate ? cell.dateStr < minDate : cell.dateStr < todayStr;
              const rateInfo = dailyRates ? dailyRates[cell.dateStr] : null;
              const isBlocked = Boolean(rateInfo?.is_blocked);
              const isBlockedFuture = isBlocked && !isPast;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDate(cell.dateStr!)}
                  title={
                    isBlockedFuture
                      ? `Tanggal ${cell.day} ${calendarGrid.monthName} sudah dipesan/diblokir`
                      : undefined
                  }
                  className={`h-8 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-gold-500 text-charcoal-950 font-bold shadow-md shadow-gold-500/30 scale-105 z-10'
                      : isPast
                      ? 'text-white/20 cursor-not-allowed'
                      : isBlockedFuture
                      ? 'bg-red-500/10 text-red-400/60 line-through border border-red-500/20 hover:bg-red-500/20 cursor-pointer'
                      : 'text-white/80 hover:bg-gold-500/20 hover:text-gold-300'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

