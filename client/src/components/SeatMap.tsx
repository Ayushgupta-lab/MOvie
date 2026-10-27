import React from 'react';
import { Clock, AlertTriangle, Armchair } from 'lucide-react';
import { Seat } from '../types/index.js';

interface SeatMapProps {
  seats: Seat[];
  categories: { name: string; price: number }[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
  holdSecondsRemaining: number;
  onProceed: () => void;
  isLoading: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  categories,
  selectedSeatIds,
  onToggleSeat,
  holdSecondsRemaining,
  onProceed,
  isLoading,
}) => {
  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Group seats by category and then by row
  const groupedByCategory = categories.map((cat) => {
    const categorySeats = seats.filter((s) => s.category.toLowerCase() === cat.name.toLowerCase());
    const rowMap = new Map<string, Seat[]>();

    for (const seat of categorySeats) {
      if (!rowMap.has(seat.row)) {
        rowMap.set(seat.row, []);
      }
      rowMap.get(seat.row)!.push(seat);
    }

    return {
      category: cat.name,
      price: cat.price,
      rows: Array.from(rowMap.entries()).map(([rowLetter, rowSeats]) => ({
        rowLetter,
        seats: rowSeats.sort((a, b) => a.number - b.number),
      })),
    };
  });

  // Calculate selected seats details & estimated total
  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.id));
  const estimatedTotal = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
      {/* 10-Minute Hold Countdown Bar */}
      {holdSecondsRemaining > 0 && (
        <div className="w-full max-w-md flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold animate-pulse-subtle">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Seats held temporarily for:</span>
          </div>
          <span className="font-mono text-base font-bold text-white bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
            {formatTime(holdSecondsRemaining)}
          </span>
        </div>
      )}

      {/* Screen Representation */}
      <div className="w-full flex flex-col items-center">
        <div className="cinema-screen-curve" />
        <span className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase -mt-4">
          All Eyes This Way • Cinema Screen
        </span>
      </div>

      {/* Interactive Seat Grid */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[640px] space-y-8">
          {groupedByCategory.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {group.category} — ₹{group.price}
                </span>
                <span className="text-[11px] text-slate-400">
                  {group.rows.reduce((acc, r) => acc + r.seats.length, 0)} Seats
                </span>
              </div>

              <div className="space-y-2">
                {group.rows.map((row) => (
                  <div key={row.rowLetter} className="flex items-center justify-center gap-2">
                    {/* Row Letter Left */}
                    <span className="w-5 text-center text-xs font-bold text-slate-400">
                      {row.rowLetter}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {row.seats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isSold = seat.status === 'sold';
                        const isHeld = seat.status === 'held' && !seat.isHeldByMe;

                        let seatStyles =
                          'bg-cinema-800 hover:bg-white/20 border-white/10 text-slate-300';

                        if (isSold) {
                          seatStyles = 'bg-cinema-900 border-white/5 text-slate-600 cursor-not-allowed';
                        } else if (isHeld) {
                          seatStyles =
                            'bg-amber-500/20 border-amber-500/40 text-amber-400 cursor-not-allowed animate-pulse';
                        } else if (isSelected) {
                          seatStyles =
                            'bg-gradient-to-tr from-brand-violet to-brand-purple border-brand-purple text-white shadow-glow scale-105';
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={isSold || isHeld}
                            onClick={() => onToggleSeat(seat.id)}
                            className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] font-semibold flex items-center justify-center transition-all ${seatStyles}`}
                            title={`Seat ${seat.id} (${seat.category}) - ₹${seat.price}`}
                          >
                            {seat.number}
                            {seat.type === 'wheelchair' && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Letter Right */}
                    <span className="w-5 text-center text-xs font-bold text-slate-400">
                      {row.rowLetter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-cinema-800 border border-white/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-brand-violet to-brand-purple border border-brand-purple shadow-glow" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-500/20 border border-amber-500/40" />
          <span>Held (Reserved)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-cinema-900 border border-white/5 opacity-50" />
          <span>Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-cinema-800 border border-white/10 relative">
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </div>
          <span>Wheelchair Space</span>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070A13]/95 backdrop-blur-md border-t border-white/10 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Selected Seats:</span>
              <span className="text-sm font-bold text-white">
                {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'None'}
              </span>
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              ₹{estimatedTotal}{' '}
              <span className="text-xs font-normal text-slate-400">+ convenience fees</span>
            </div>
          </div>

          <button
            disabled={selectedSeatIds.length === 0 || isLoading}
            onClick={onProceed}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
              selectedSeatIds.length > 0 && !isLoading
                ? 'bg-gradient-to-r from-brand-violet to-brand-purple hover:brightness-110 text-white shadow-glow'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Armchair className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Reserving Seats...'
                : `Book ${selectedSeatIds.length || ''} Seat${
                    selectedSeatIds.length === 1 ? '' : 's'
                  }`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
