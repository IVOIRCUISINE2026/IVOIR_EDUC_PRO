import React from 'react';
import { GraduationCap, BookOpen, Layers, ChevronRight, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { LearningMode } from '../types';

interface HomeScreenProps {
  selectedGrade: string;
  selectedSubject: string;
  selectedMode: LearningMode;
  onOpenGradeSelect: () => void;
  onOpenModeSelect: () => void;
  onOpenSubjectSelect: () => void;
  onStartChat: () => void;
  onOpenDesignerInfo: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedGrade,
  selectedSubject,
  selectedMode,
  onOpenGradeSelect,
  onOpenModeSelect,
  onOpenSubjectSelect,
  onStartChat,
  onOpenDesignerInfo,
}) => {
  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-4 pt-3">
      {/* Quick Launch Active Configuration Banner if set */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Session Active</span>
          </div>
          <p className="text-sm font-extrabold truncate mt-0.5 font-heading">
            {selectedGrade} • {selectedSubject}
          </p>
          <p className="text-[11px] text-emerald-100/90 truncate">
            Mode: <span className="font-semibold text-white">{selectedMode}</span>
          </p>
        </div>
        <button
          onClick={onStartChat}
          className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1 font-heading"
        >
          <span>Démarrer</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. NIVEAU SCOLAIRE Card (Orange Gradient Card) */}
      <button
        onClick={onOpenGradeSelect}
        className="w-full text-left bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] transition-all duration-200 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 border border-orange-400/30 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <GraduationCap className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide font-heading leading-tight">
                NIVEAU SCOLAIRE
              </h3>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                {selectedGrade ? `Actuel : ${selectedGrade}` : 'Choisissez votre niveau'}
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </button>

      {/* 2. MODE D'APPRENTISSAGE Card (Green Gradient Card) */}
      <button
        onClick={onOpenModeSelect}
        className="w-full text-left bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] transition-all duration-200 rounded-2xl p-4 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <BookOpen className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide font-heading leading-tight">
                MODE D'APPRENTISSAGE
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                {selectedMode ? selectedMode : 'Sélectionnez votre mode'}
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </button>

      {/* 3. MATIÈRES Card (White Card with Green/Orange accents) */}
      <button
        onClick={onOpenSubjectSelect}
        className="w-full text-left bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 rounded-2xl p-4 text-slate-800 shadow-md border border-slate-200/90 relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200">
              <Layers className="w-7 h-7 text-emerald-600 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-slate-800 font-heading leading-tight">
                MATIÈRES
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {selectedSubject ? `Matière : ${selectedSubject}` : 'Explorez les matières'}
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </button>

      {/* Banner Photo: High School Students Studying Together */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 group">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80"
          alt="Élèves de Côte d'Ivoire révisant ensemble"
          className="w-full h-44 sm:h-52 object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-4 flex flex-col justify-end">
          <span className="bg-orange-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md w-fit mb-1 font-heading">
            Programme MENA Officiel
          </span>
          <h4 className="text-white font-extrabold text-base font-heading leading-snug">
            Réussissez vos examens nationaux (CEPE, BEPC, BAC A/C/D)
          </h4>
          <p className="text-slate-300 text-xs mt-0.5 line-clamp-1 font-medium">
            Exercices corrigés, fiches synthétiques et soutien personnalisé.
          </p>
        </div>
      </div>

      {/* Footer Banner - Designer Credit */}
      <div 
        onClick={onOpenDesignerInfo}
        className="w-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-3.5 rounded-2xl shadow-md border border-orange-400/30 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-black tracking-tight font-heading leading-tight">
              Conçu par Jean Cyrille Ahoret
            </p>
            <p className="text-[11px] text-orange-100 font-semibold flex items-center gap-1 mt-0.5">
              <PhoneCall className="w-3 h-3 text-yellow-200" />
              <span>Contact : 2250704002387</span>
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white shrink-0" />
      </div>
    </div>
  );
};
