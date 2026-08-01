import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
  selectedGrade: string;
  selectedSubject: string;
  updatesCount?: number;
  onOpenUpdates?: () => void;
  studentName?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMenu, 
  selectedGrade, 
  selectedSubject,
  updatesCount = 2,
  onOpenUpdates,
  studentName
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-xs transition-colors">
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
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-heading truncate max-w-[200px] sm:max-w-[300px]">
              {studentName ? `Bonjour, ${studentName}` : 'Bonjour, Étudiant'}
            </h2>
            <span className="text-lg animate-bounce shrink-0">👋</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            Prêt à apprendre aujourd'hui ?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpdates}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 relative transition-all active:scale-95 cursor-pointer"
            title={`${updatesCount} mise${updatesCount > 1 ? 's' : ''} à jour disponible${updatesCount > 1 ? 's' : ''}`}
          >
            <Bell className="w-5 h-5" />
            {updatesCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-bounce">
                {updatesCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                0
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Brand Banner */}
      <div className="mt-3 py-2 text-center max-w-2xl mx-auto border-t border-slate-100/60 dark:border-slate-800/80 pt-2.5">
        <div className="flex items-center justify-center gap-2">
          {/* Graduation Cap Logo Icon */}
          <div className="relative inline-flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-sm">🎓</span>
          </div>

          <div className="text-left leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400 font-heading">
                Ivoir'
              </span>
              <span className="text-2xl font-black tracking-tight text-orange-500 dark:text-orange-400 font-heading">
                Educ
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wider uppercase ml-1">
                PRO
              </span>
            </div>
          </div>
        </div>

        <p className="text-[12px] font-bold text-slate-600 dark:text-slate-400 tracking-wide mt-1">
          <span className="text-slate-800 dark:text-slate-200">Apprendre</span>
          <span className="mx-1 text-orange-500">•</span>
          <span className="text-orange-600 dark:text-orange-400">Comprendre</span>
          <span className="mx-1 text-orange-500">•</span>
          <span className="text-emerald-700 dark:text-emerald-400">Réussir</span>
        </p>
      </div>
    </header>
  );
};
