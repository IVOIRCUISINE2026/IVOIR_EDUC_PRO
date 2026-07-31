import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SUBJECTS_LIST } from '../constants/data';
import { SubjectItem } from '../types';

interface MatieresViewProps {
  selectedSubject: string;
  onSelectSubject: (subjectName: string) => void;
  onClose: () => void;
}

export const MatieresView: React.FC<MatieresViewProps> = ({
  selectedSubject,
  onSelectSubject,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full sm:h-[88vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header - Emerald Green Bar matching mockup */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-700 to-emerald-800 px-4 py-4 text-white flex items-center gap-3 shrink-0 shadow-md">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading">
            MATIÈRES
          </h2>
        </div>

        {/* Subjects 3-Column Grid matching bottom phone mockup */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
            Sélectionnez la matière à étudier
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUBJECTS_LIST.map((subject: SubjectItem) => {
              const isSelected = selectedSubject === subject.name;
              return (
                <button
                  key={subject.id}
                  onClick={() => {
                    onSelectSubject(subject.name);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-center relative group active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    </div>
                  )}

                  {/* Icon Container with subject specific color */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 shadow-xs transition-transform group-hover:scale-110"
                    style={{ backgroundColor: subject.bgColor }}
                  >
                    {subject.flag ? (
                      <span className="text-3xl filter drop-shadow-xs">{subject.flag}</span>
                    ) : (
                      <span className="text-2xl filter drop-shadow-xs">
                        {subject.id === 'philo' && '🧠'}
                        {subject.id === 'francais' && '📖'}
                        {subject.id === 'histgeo' && '🌍'}
                        {subject.id === 'edhc' && '👥'}
                        {subject.id === 'maths' && '🧮'}
                        {subject.id === 'pc' && '🧪'}
                        {subject.id === 'svt' && '🍃'}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-extrabold text-slate-800 font-heading leading-tight max-w-[110px] truncate">
                    {subject.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
