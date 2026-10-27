import React from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerUrl,
  movieTitle,
}) => {
  if (!isOpen) return null;

  // Extract YouTube ID
  let videoId = '';
  if (trailerUrl.includes('v=')) {
    videoId = trailerUrl.split('v=')[1]?.split('&')[0] || '';
  } else if (trailerUrl.includes('youtu.be/')) {
    videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  }

  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : trailerUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-cinema-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-cinema-850">
          <h3 className="text-base font-bold text-white truncate">{movieTitle} - Official Trailer</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {videoId ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Trailer link: {trailerUrl}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
