import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, ArrowLeft } from 'lucide-react';

interface WhatsAppImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName?: string;
  senderName?: string;
  timestamp?: string;
  caption?: string;
}

export const WhatsAppImageLightbox: React.FC<WhatsAppImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  fileName = 'Photo',
  senderName = 'Orator',
  timestamp,
  caption
}) => {
  const [zoom, setZoom] = useState<number>(1);

  // Reset zoom on open or image change
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen, imageUrl]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(3, z + 0.25));
      } else if (e.key === '-') {
        setZoom(z => Math.max(0.5, z - 0.25));
      } else if (e.key === '0') {
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = fileName || 'globalorators-photo.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Action Bar */}
      <div 
        className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-white shrink-0 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">{fileName}</h4>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
              <span>{senderName}</span>
              {timestamp && (
                <>
                  <span>•</span>
                  <span>{timestamp}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Zoom & Download Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span 
              onClick={handleResetZoom}
              className="text-[10px] font-mono px-2 text-slate-400 hover:text-white cursor-pointer"
              title="Reset Zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
            title="Download Full Image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div 
        className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative"
        onClick={onClose}
      >
        <div 
          className="relative max-w-full max-h-full transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoom})` }}
          onClick={e => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={fileName}
            className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-2xl pointer-events-auto"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      {caption && (
        <div 
          className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 text-center shrink-0 z-10"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed font-sans">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
