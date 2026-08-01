import React from 'react';
import { X, Sparkles, CheckCircle2, Bell, ArrowRight, Zap, ShieldCheck, BookOpen, HardDrive } from 'lucide-react';
import { APP_UPDATES, AppUpdate, markAllUpdatesAsRead, markUpdateAsRead } from '../constants/updatesData';

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  readUpdateIds: string[];
  onUpdatesReadChange: (newReadIds: string[]) => void;
  onNavigateToFeature?: (featureKey: string) => void;
}

export const UpdatesModal: React.FC<UpdatesModalProps> = ({
  isOpen,
  onClose,
  readUpdateIds,
  onUpdatesReadChange,
  onNavigateToFeature
}) => {
  if (!isOpen) return null;

  const unreadCount = APP_UPDATES.filter(u => !readUpdateIds.includes(u.id)).length;

  const handleMarkAllRead = () => {
    const updated = markAllUpdatesAsRead();
    onUpdatesReadChange(updated);
  };

  const handleItemClick = (updateId: string) => {
    const updated = markUpdateAsRead(updateId);
    onUpdatesReadChange(updated);
  };

  const handleClose = () => {
    const updated = markAllUpdatesAsRead();
    onUpdatesReadChange(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] transition-colors">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-900 p-5 text-white relative flex items-start justify-between shrink-0">
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider font-heading">
              <Sparkles className="w-3 h-3" />
              <span>Nouveautés & Mises à jour</span>
            </div>
            <h2 className="text-xl font-black font-heading tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-300" />
              <span>Mises à jour de l'application</span>
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Découvrez les {APP_UPDATES.length} nouvelles fonctionnalités récentes d'Ivoir'Educ.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unread Action Bar */}
        {unreadCount > 0 && (
          <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-200 dark:border-amber-800/60 px-5 py-2.5 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{unreadCount} mise{unreadCount > 1 ? 's' : ''} à jour non lue{unreadCount > 1 ? 's' : ''}</span>
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-black underline hover:text-amber-700 dark:hover:text-amber-100 cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          </div>
        )}

        {/* Updates Content List */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
          {APP_UPDATES.map((update, idx) => {
            const isRead = readUpdateIds.includes(update.id);
            return (
              <div
                key={update.id}
                onClick={() => handleItemClick(update.id)}
                className={`pt-4 first:pt-0 space-y-3 cursor-pointer group transition-all`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-heading bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {update.version}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        • {update.date}
                      </span>
                      {!isRead && (
                        <span className="text-[9px] font-black bg-orange-500 text-white px-1.5 py-0.2 rounded-md uppercase tracking-wide animate-pulse">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-heading">
                      {update.title}
                    </h3>
                  </div>

                  {isRead ? (
                    <span title="Lue" className="shrink-0 p-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="shrink-0 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-950/60 mt-1" />
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {update.description}
                </p>

                {/* Features list */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-heading">
                    Points forts de cette version :
                  </span>
                  <ul className="space-y-1.5">
                    {update.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Mises à jour régulières pour le BEPC & BAC
          </p>

          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-black text-xs hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer shadow-xs active:scale-95 font-heading"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
