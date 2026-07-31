import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { GRADES_LIST } from '../constants/data';

interface NiveauScolaireModalProps {
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
  onClose: () => void;
}

export const NiveauScolaireModal: React.FC<NiveauScolaireModalProps> = ({
  selectedGrade,
  onSelectGrade,
  onClose,
}) => {
  const [tempGrade, setTempGrade] = useState<string>(selectedGrade || "3ème");

  const handleValidate = () => {
    onSelectGrade(tempGrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full sm:h-[88vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header - Orange Bar matching mockup */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-4 py-4 text-white flex items-center gap-3 shrink-0 shadow-md">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading">
            NIVEAU SCOLAIRE
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Sélectionnez votre niveau scolaire
          </p>
        </div>

        {/* Grades Radio List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {GRADES_LIST.map((grade) => {
            const isSelected = tempGrade === grade;
            return (
              <button
                key={grade}
                onClick={() => setTempGrade(grade)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50/80 border-orange-500 text-orange-950 font-black shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-heading">{grade}</span>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Button - Emerald Green Button matching mockup */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <button
            onClick={handleValidate}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 transition-all font-heading"
          >
            VALIDER
          </button>
        </div>
      </div>
    </div>
  );
};
