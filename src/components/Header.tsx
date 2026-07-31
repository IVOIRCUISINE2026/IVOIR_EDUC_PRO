import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  selectedGrade: string;
  selectedSubject: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, selectedGrade, selectedSubject }) => {
  return (
    <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-30 shadow-xs">
      {/* Top Row: Menu Button, Greeting, Notification Bell */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="text-center flex-1 mx-3">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight font-heading">
              Bonjour, Étudiant
            </h2>
            <span className="text-lg animate-bounce">👋</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            Prêt à apprendre aujourd'hui ?
          </p>
        </div>

        <button
          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition-all active:scale-95"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>
      </div>

      {/* Brand Banner */}
      <div className="mt-3 py-2 text-center max-w-2xl mx-auto border-t border-slate-100/60 pt-2.5">
        <div className="flex items-center justify-center gap-2">
          {/* Graduation Cap Logo Icon */}
          <div className="relative inline-flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-sm">🎓</span>
          </div>

          <div className="text-left leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-emerald-800 font-heading">
                Ivoir'
              </span>
              <span className="text-2xl font-black tracking-tight text-orange-500 font-heading">
                Educ
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wider uppercase ml-1">
                PRO
              </span>
            </div>
          </div>
        </div>

        <p className="text-[12px] font-bold text-slate-600 tracking-wide mt-1">
          <span className="text-slate-800">Apprendre</span>
          <span className="mx-1 text-orange-500">•</span>
          <span className="text-orange-600">Comprendre</span>
          <span className="mx-1 text-orange-500">•</span>
          <span className="text-emerald-700">Réussir</span>
        </p>
      </div>
    </header>
  );
};
