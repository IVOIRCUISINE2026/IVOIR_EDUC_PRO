import React, { useState, useEffect } from 'react';
import { GraduationCap, ChevronRight, Calendar, Clock } from 'lucide-react';

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/40 via-white to-emerald-50/20 flex flex-col justify-between items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative side borders matching Ivoirian flag colors */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 sm:w-3.5 bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-2.5 sm:w-3.5 bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700 z-10" />

      {/* Top Highlighted Date and Time Banner */}
      <div className="w-full pt-3 flex justify-center z-20">
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg shadow-orange-500/20 border-2 border-white ring-2 ring-orange-400/40 flex items-center gap-2 text-xs sm:text-sm font-black tracking-wide font-heading uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping shrink-0" />
          <Calendar className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="capitalize">{formattedDate}</span>
          <span className="text-orange-200 font-extrabold">&bull;</span>
          <Clock className="w-4 h-4 text-amber-200 shrink-0" />
          <span className="font-mono tracking-wider text-amber-100">{formattedTime}</span>
        </div>
      </div>

      {/* Center Container matching exact layout in image */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center px-4 space-y-6 sm:space-y-8 my-auto py-4">
        
        {/* App Icon: Orange Squircle with Graduation Cap */}
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 rounded-[28px] sm:rounded-[32px] flex items-center justify-center shadow-xl shadow-orange-500/25 border-2 border-white/40 transform transition-transform group-hover:scale-105">
            <GraduationCap className="w-13 h-13 sm:w-16 sm:h-16 text-white stroke-[2.2] drop-shadow-md" />
          </div>
          {/* Subtle glow effect behind logo */}
          <div className="absolute -inset-1 bg-orange-400 rounded-[34px] blur-lg opacity-20 -z-10" />
        </div>

        {/* Header Titles */}
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-orange-600 leading-tight">
            Bienvenue sur <br />
            <span className="text-orange-500">IvoirEduc Pro</span>
          </h1>
          <p className="text-base sm:text-lg font-extrabold text-slate-700 tracking-tight font-heading">
            by <span className="text-emerald-600 font-black">Jean Cyrille AHORET</span>
          </p>
        </div>

        {/* Quote Card */}
        <div className="w-full bg-[#FFFDF7] border border-orange-200/60 rounded-3xl p-6 sm:p-7 shadow-sm shadow-orange-950/5 relative text-center">
          <p className="text-slate-700 text-sm sm:text-base font-medium italic leading-relaxed sm:leading-relaxed text-balance">
            &ldquo;L'éducation est l'arme la plus puissante que l'on puisse utiliser pour changer le monde. Avec IvoirEduc Pro, forgeons ensemble l'excellence de demain pour une Côte d'Ivoire plus forte.&rdquo;
          </p>
        </div>

        {/* Connection Zone & Main Button */}
        <div className="w-full pt-2 sm:pt-4 space-y-3 flex flex-col items-center">
          <span className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase font-heading">
            ZONE DE CONNEXION
          </span>

          <button
            onClick={onEnterApp}
            className="w-full max-w-xs bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white py-4 px-8 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-heading group"
          >
            <span>Cliquez ici</span>
            <ChevronRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Ivoirian Flag Color Bars at the Bottom */}
        <div className="flex items-center justify-center gap-2.5 pt-4">
          <div className="w-12 h-1.5 rounded-full bg-orange-500 shadow-2xs" />
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-2xs" />
          <div className="w-12 h-1.5 rounded-full bg-emerald-500 shadow-2xs" />
        </div>

      </div>

      {/* Bottom Footer note */}
      <div className="w-full text-center pb-4 text-[11px] font-bold text-slate-400 font-heading">
        Ivoir'Educ PRO &bull; Système Éducatif de Côte d'Ivoire (MENA)
      </div>
    </div>
  );
};
