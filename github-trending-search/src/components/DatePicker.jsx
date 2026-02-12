import { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DatePicker({ value, onChange, placeholder = 'Select date', id, minDate, maxDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;
  const minDateTime = minDate ? new Date(minDate) : null;
  const maxDateTime = maxDate ? new Date(maxDate) : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function handlePrevMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  }

  function handlePrevYear() {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  }

  function handleNextYear() {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  }

  function isDateDisabled(day) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    
    if (minDateTime) {
      const min = new Date(minDateTime);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }
    
    if (maxDateTime) {
      const max = new Date(maxDateTime);
      max.setHours(23, 59, 59, 999);
      if (date > max) return true;
    }
    
    // Don't allow future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) return true;
    
    return false;
  }

  function handleDateSelect(day) {
    if (isDateDisabled(day)) return;
    
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formattedDate = newDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  }

  function handleToday() {
    const today = new Date();
    if (minDateTime && today < minDateTime) return;
    if (maxDateTime && today > maxDateTime) return;
    
    const formattedDate = today.toISOString().split('T')[0];
    onChange(formattedDate);
    setViewDate(today);
    setIsOpen(false);
  }

  function handleClear() {
    onChange('');
    setIsOpen(false);
  }

  function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function isToday(day) {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  }

  function isSelected(day) {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  }

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const prevMonthDays = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth() - 1);

  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isPrevMonth: false
    });
  }
  
  // Next month days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isPrevMonth: false
    });
  }

  return (
    <div className="datepicker-container" ref={containerRef}>
      <div 
        className={`datepicker-input ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        id={id}
      >
        <span className="datepicker-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span className={`datepicker-value ${!value ? 'placeholder' : ''}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <span className="datepicker-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="datepicker-dropdown">
          <div className="datepicker-header">
            <button type="button" className="nav-btn" onClick={handlePrevYear} title="Previous Year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7"/>
                <polyline points="18 17 13 12 18 7"/>
              </svg>
            </button>
            <button type="button" className="nav-btn" onClick={handlePrevMonth} title="Previous Month">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className="current-month-year">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" className="nav-btn" onClick={handleNextMonth} title="Next Month">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <button type="button" className="nav-btn" onClick={handleNextYear} title="Next Year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7"/>
                <polyline points="6 17 11 12 6 7"/>
              </svg>
            </button>
          </div>

          <div className="datepicker-weekdays">
            {DAYS.map(day => (
              <span key={day} className="weekday">{day}</span>
            ))}
          </div>

          <div className="datepicker-days">
            {calendarDays.map((item, index) => {
              const disabled = !item.isCurrentMonth || isDateDisabled(item.day);
              return (
                <button
                  key={index}
                  type="button"
                  className={`day-btn ${item.isCurrentMonth ? '' : 'other-month'} ${isToday(item.day) && item.isCurrentMonth ? 'today' : ''} ${isSelected(item.day) && item.isCurrentMonth ? 'selected' : ''} ${disabled && item.isCurrentMonth ? 'disabled' : ''}`}
                  onClick={() => !disabled && handleDateSelect(item.day)}
                  disabled={disabled}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          <div className="datepicker-footer">
            <button type="button" className="footer-btn today-btn" onClick={handleToday}>
              Today
            </button>
            <button type="button" className="footer-btn clear-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
