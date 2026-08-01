import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Zap, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';

export type AssessmentType = 'interrogation' | 'devoir';

interface AssessmentTimerProps {
  selectedGrade: string;
  selectedSubject: string;
  onStartAssessment: (type: AssessmentType, durationMinutes: number, promptText: string) => void;
  onTimeExpired: (type: AssessmentType) => void;
}

export const AssessmentTimer: React.FC<AssessmentTimerProps> = ({
  selectedGrade,
  selectedSubject,
  onStartAssessment,
  onTimeExpired,
}) => {
  const [activeType, setActiveType] = useState<AssessmentType | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(900); // Default 15 min
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      onTimeExpired(activeType || 'interrogation');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, activeType, onTimeExpired]);

  const selectOption = (type: AssessmentType) => {
    const minutes = type === 'interrogation' ? 15 : 45;
    const durationSec = minutes * 60;
    setActiveType(type);
    setTotalSeconds(durationSec);
    setSecondsRemaining(durationSec);
    setIsRunning(false);
    setHasStarted(false);
  };

  const handleStartExam = () => {
    if (!activeType) return;
    setIsRunning(true);
    setHasStarted(true);

    const minutes = activeType === 'interrogation' ? 15 : 45;
    const promptText = activeType === 'interrogation'
      ? `[MODE CHRONOMÉTRÉ 15 MIN - INTERROGATION ÉCRITE]\nPropose une interrogation écrite rapide de 15 minutes en ${selectedSubject} pour la classe de ${selectedGrade}.\n- Inclure 3 à 4 questions de contrôle de connaissances et d'application directe.\n- Ne donne PAS le corrigé immédiatement (invite-moi à soumettre mes réponses).`
      : `[MODE CHRONOMÉTRÉ 45 MIN - DEVOIR DE SYNTHÈSE]\nPropose un devoir de synthèse complet de 45 minutes en ${selectedSubject} pour la classe de ${selectedGrade} (conforme aux exigences MENA Côte d'Ivoire).\n- Structurer le devoir en 2 ou 3 exercices progressifs.\n- Ne donne PAS le corrigé immédiatement (invite-moi à rédiger mes réponses avant la fin du temps).`;

    onStartAssessment(activeType, minutes, promptText);
  };

  const togglePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    const minutes = activeType === 'interrogation' ? 15 : 45;
    const durationSec = minutes * 60;
    setSecondsRemaining(durationSec);
    setIsRunning(false);
    setHasStarted(false);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? (secondsRemaining / totalSeconds) * 100 : 0;
  const isLowTime = secondsRemaining <= 180 && secondsRemaining > 0; // Less than 3 minutes

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3 font-sans">
      {/* Option Selector Header */}
      <div className="flex items-center justify-between text-xs font-heading font-extrabold text-slate-600 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-slate-800">
          <Clock className="w-4 h-4 text-orange-500" />
          Choisissez le type d'épreuve :
        </span>
        {activeType && (
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
            Chronomètre actif
          </span>
        )}
      </div>

      {/* Selector Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => selectOption('interrogation')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeType === 'interrogation'
              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 text-orange-950 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-4 h-4 shrink-0 ${activeType === 'interrogation' ? 'text-orange-600' : 'text-slate-500'}`} />
              <span className="text-xs font-black font-heading truncate">Interrogation</span>
            </div>
            <p className="text-[11px] font-bold text-orange-700 font-mono mt-0.5">
              ⏱️ 15 minutes
            </p>
          </div>
          {activeType === 'interrogation' && (
            <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
          )}
        </button>

        <button
          onClick={() => selectOption('devoir')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeType === 'devoir'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeType === 'devoir' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="text-xs font-black font-heading truncate">Devoir</span>
            </div>
            <p className="text-[11px] font-bold text-emerald-700 font-mono mt-0.5">
              ⏱️ 45 minutes
            </p>
          </div>
          {activeType === 'devoir' && (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
        </button>
      </div>

      {/* Timer Dashboard (shows when an option is selected) */}
      {activeType && (
        <div className={`p-3.5 rounded-xl border transition-all ${
          secondsRemaining === 0
            ? 'bg-red-50 border-red-300'
            : isLowTime
            ? 'bg-amber-50 border-amber-300 animate-pulse'
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className={`text-[10px] font-black uppercase font-heading px-2 py-0.5 rounded-md ${
                secondsRemaining === 0
                  ? 'bg-red-200 text-red-900'
                  : 'bg-white/20 text-white'
              }`}>
                {activeType === 'interrogation' ? '⚡ Interrogation (15 min)' : '📝 Devoir (45 min)'}
              </span>

              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-wider ${
                  secondsRemaining === 0 ? 'text-red-700' : isLowTime ? 'text-amber-800' : 'text-emerald-400'
                }`}>
                  {formatTime(secondsRemaining)}
                </span>
                {isLowTime && secondsRemaining > 0 && (
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Temps bientôt écoulé !
                  </span>
                )}
                {secondsRemaining === 0 && (
                  <span className="text-xs font-extrabold text-red-700">
                    ⏱️ TEMPS ÉCOULÉ !
                  </span>
                )}
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-1.5">
              {!hasStarted ? (
                <button
                  onClick={handleStartExam}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 font-heading cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lancer l'épreuve</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePlayPause}
                    disabled={secondsRemaining === 0}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRunning
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                    title={isRunning ? 'Mettre en pause' : 'Reprendre'}
                  >
                    {isRunning ? <Pause className="w-4.5 h-4.5 fill-white" /> : <Play className="w-4.5 h-4.5 fill-white" />}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    title="Réinitialiser le chronomètre"
                  >
                    <RotateCcw className="w-4.5 h-4.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/60 h-2 rounded-full mt-3 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                secondsRemaining === 0
                  ? 'bg-red-600'
                  : isLowTime
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
