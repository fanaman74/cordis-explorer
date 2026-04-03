import { useState, useMemo } from 'react';
import type { BrokerageEvent } from '../../hooks/useEvents';

interface CalendarViewProps {
  events: BrokerageEvent[];
  isLoading?: boolean;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CATEGORY_COLORS: Record<string, string> = {
  'EEN Brokerage':             'bg-blue-500',
  'EC Research & Innovation':  'bg-purple-500',
  'MSCA':                      'bg-amber-500',
  'ERC':                       'bg-rose-500',
  'Horizon Europe':            'bg-emerald-500',
};

function dotColor(category?: string): string {
  if (!category) return 'bg-[var(--color-eu-blue)]';
  return CATEGORY_COLORS[category] ?? 'bg-[var(--color-eu-blue)]';
}

/** Returns YYYY-MM-DD string for a Date */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CalendarView({ events, isLoading }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build map: dateStr → events[]
  const eventsByDate = useMemo(() => {
    const map = new Map<string, BrokerageEvent[]>();
    for (const ev of events) {
      if (!ev.startDate) continue;
      const existing = map.get(ev.startDate) ?? [];
      existing.push(ev);
      map.set(ev.startDate, existing);
    }
    return map;
  }, [events]);

  // Calendar grid computation
  const { days, firstWeekday } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay() returns 0=Sun..6=Sat; convert to Mon-first (0=Mon..6=Sun)
    let wd = new Date(year, month, 1).getDay();
    wd = wd === 0 ? 6 : wd - 1;
    return { days: daysInMonth, firstWeekday: wd };
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const todayStr = toDateStr(today);
  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : [];

  // Events in this month (for side list)
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEvents = events.filter(e => e.startDate?.startsWith(monthStr));

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
        {/* Calendar grid */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
            {/* Empty cells before first day */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-[var(--color-bg-card)] min-h-[52px]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const isPast = dateStr < todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`
                    bg-[var(--color-bg-card)] min-h-[52px] p-1.5 text-left transition-colors relative
                    hover:bg-[var(--color-border)]/50
                    ${isSelected ? 'ring-2 ring-inset ring-[var(--color-eu-blue)]' : ''}
                    ${isPast && !isToday ? 'opacity-40' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full
                    ${isToday ? 'bg-[var(--color-eu-blue)] text-white' : 'text-[var(--color-text-primary)]'}
                  `}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, j) => (
                        <span key={j} className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(ev.category)}`} />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-[var(--color-text-secondary)]">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3 text-center">
            Dates are indicative — verify on official call pages before submitting.
          </p>
        </div>

        {/* Side panel */}
        <div className="p-4 overflow-y-auto max-h-[420px]">
          {selectedDate ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">No events on this date.</p>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map(ev => (
                    <EventCard key={ev.id} ev={ev} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                {monthEvents.length > 0 ? `${MONTHS[month]} events` : 'No events this month'}
              </p>
              {monthEvents.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  No events found for this month. Try browsing the sources above, or navigate to another month.
                </p>
              ) : (
                <div className="space-y-3">
                  {monthEvents.map(ev => (
                    <EventCard key={ev.id} ev={ev} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: BrokerageEvent }) {
  return (
    <div className="text-xs space-y-0.5">
      <div className="flex items-start gap-1.5">
        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotColor(ev.category)}`} />
        <div className="flex-1 min-w-0">
          {ev.registrationUrl ? (
            <a
              href={ev.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-eu-blue-lighter)] hover:underline leading-snug block"
            >
              {ev.title}
            </a>
          ) : (
            <p className="font-medium text-[var(--color-text-primary)] leading-snug">{ev.title}</p>
          )}
          {(ev.city || ev.country) && (
            <p className="text-[var(--color-text-secondary)]">
              📍 {[ev.city, ev.country].filter(Boolean).join(', ')}
            </p>
          )}
          {ev.endDate && ev.endDate !== ev.startDate && (
            <p className="text-[var(--color-text-secondary)]">
              Until {new Date(ev.endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </p>
          )}
          {ev.category && (
            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[var(--color-border)] text-[var(--color-text-secondary)]">
              {ev.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
