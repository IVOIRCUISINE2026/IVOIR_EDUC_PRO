import React from 'react';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { LEARNING_MODES } from '../constants/data';
import { LearningMode } from '../types';

interface ModeApprentissageViewProps {
  selectedMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
  onClose: () => void;
}

export const ModeApprentissageView: React.FC<ModeApprentissageViewProps> = ({
  selectedMode,
  onSelectMode,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header - Emerald Green Bar matching mockup */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-700 to-emerald-800 px-4 py-4 text-white flex items-center gap-3 shrink-0 shadow-md">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading">
            MODE D'APPRENTISSAGE
          </h2>
        </div>

        {/* List of Learning Modes matching mockup */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-slate-100">
          {LEARNING_MODES.map((modeItem) => {
            const isSelected = selectedMode === modeItem.title;
            return (
              <button
                key={modeItem.title}
                onClick={() => {
                  onSelectMode(modeItem.title);
                  onClose();
                }}
                className={`w-full text-left py-3 px-3.5 rounded-xl flex items-center justify-between transition-all cursor-pointer group pt-3 ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-xl shrink-0 p-1 bg-slate-100/80 rounded-lg group-hover:scale-110 transition-transform">
                    {modeItem.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-heading font-extrabold truncate">
                      {modeItem.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {modeItem.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSelected ? (
                    <span className="bg-emerald-600 text-white p-1 rounded-full text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
