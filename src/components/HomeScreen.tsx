import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Layers, ChevronRight, ShieldCheck, PhoneCall, Sparkles, LogOut, Calendar, Clock } from 'lucide-react';
import { LearningMode } from '../types';
import { LogoutModal } from './LogoutModal';

interface HomeScreenProps {
  selectedGrade: string;
  selectedSubject: string;
  selectedMode: LearningMode;
  onOpenGradeSelect: () => void;
  onOpenModeSelect: () => void;
  onOpenSubjectSelect: () => void;
  onStartChat: () => void;
  onOpenDesignerInfo: () => void;
  onLogoutAndSave?: () => void;
  onLogoutWithoutSave?: () => void;
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
  onLogoutAndSave,
  onLogoutWithoutSave,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleSaveAndQuit = () => {
    if (onLogoutAndSave) {
      onLogoutAndSave();
    } else {
      localStorage.setItem('ivoireduc_last_grade', selectedGrade);
      localStorage.setItem('ivoireduc_last_subject', selectedSubject);
      localStorage.setItem('ivoireduc_saved_at', new Date().toISOString());
    }
    setShowLogoutModal(false);
  };

  const handleQuitWithoutSave = () => {
    if (onLogoutWithoutSave) {
      onLogoutWithoutSave();
    }
    setShowLogoutModal(false);
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Highlighted Date & Time Banner */}
      <div className="w-full flex justify-center pb-1">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 text-white px-4 py-2 rounded-2xl shadow-md border border-orange-300/40 flex items-center justify-between w-full font-heading">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black capitalize">
            <Calendar className="w-4 h-4 text-amber-200 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black bg-white/20 px-2.5 py-1 rounded-xl backdrop-blur-xs font-mono tracking-wider text-amber-100">
            <Clock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

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

      {/* Special Primary French Modules Card on Home if CM1 or CM2 and Français is active */}
      {(selectedGrade === 'CM1' || selectedGrade === 'CM2') && selectedSubject === 'Français' && (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-700 space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400" />
              <h4 className="text-xs font-black uppercase tracking-wider font-heading text-emerald-100">
                Leçons du Programme MENA ({selectedGrade})
              </h4>
            </div>
            <span className="text-[10px] bg-orange-500/90 text-white font-extrabold px-2 py-0.5 rounded-full font-heading">
              Français
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onStartChat}
              className="bg-white/10 hover:bg-white/20 active:scale-[0.98] p-3 rounded-xl border border-white/20 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📖</span>
                <span className="text-xs font-black text-white font-heading group-hover:text-orange-300 transition-colors">
                  Exploitation de texte 1
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Vocabulaire et Orthographe
              </p>
            </button>

            <button
              onClick={onStartChat}
              className="bg-white/10 hover:bg-white/20 active:scale-[0.98] p-3 rounded-xl border border-white/20 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">✍️</span>
                <span className="text-xs font-black text-white font-heading group-hover:text-orange-300 transition-colors">
                  Exploitation de texte 2
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium">
                Grammaire et Conjugaison
              </p>
            </button>
          </div>
        </div>
      )}

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

      {/* Footer Section: Designer Credit + Logout Button */}
      <div className="space-y-2">
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

        {/* Déconnexion Icon Button directly below 'Conçu par Jean Cyrille Ahoret' */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer font-heading"
        >
          <LogOut className="w-4 h-4 stroke-[2.5]" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Logout Dialog */}
      {showLogoutModal && (
        <LogoutModal
          onClose={() => setShowLogoutModal(false)}
          onSaveAndQuit={handleSaveAndQuit}
          onQuitWithoutSave={handleQuitWithoutSave}
        />
      )}
    </div>
  );
};
