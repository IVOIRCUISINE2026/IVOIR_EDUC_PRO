import React, { useState } from 'react';
import { LogOut, Save, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LogoutModalProps {
  onClose: () => void;
  onSaveAndQuit: () => void;
  onQuitWithoutSave: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  onClose,
  onSaveAndQuit,
  onQuitWithoutSave,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSaveAndQuit = () => {
    setStatusMessage('Sauvegarde des données de révision en cours...');
    setTimeout(() => {
      onSaveAndQuit();
    }, 800);
  };

  const handleQuitWithoutSave = () => {
    onQuitWithoutSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-orange-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors absolute top-4 right-4"
            title="Annuler"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-sm">
              <LogOut className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-heading uppercase text-white">
                Déconnexion
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                Ivoir'Educ PRO - Session d'apprentissage
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {statusMessage ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Voulez-vous vraiment vous déconnecter ? Vous pouvez sauvegarder vos paramètres et l'historique de vos révisions avant de quitter.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Sauvegarder et quitter */}
                <button
                  onClick={handleSaveAndQuit}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white p-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/20 transition-all font-heading cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Sauvegarder et quitter</span>
                </button>

                {/* 2. Quitter sans sauvegarder */}
                <button
                  onClick={handleQuitWithoutSave}
                  className="w-full bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-700 border border-red-200 p-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all font-heading cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                  <span>Quitter sans sauvegarder</span>
                </button>

                {/* 3. Annuler */}
                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 p-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center transition-all font-heading cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
