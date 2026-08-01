import React from 'react';
import { ArrowLeft, Award, Flame, CheckCircle, TrendingUp, Sparkles, BookOpen, Archive, Clock, Compass, ChevronRight, HardDrive, User, GraduationCap, Building2, Edit3 } from 'lucide-react';
import { INITIAL_BADGES } from '../constants/data';
import { getEvaluationHistory, getCounselorHistory } from '../utils/historyStorage';
import { getCachedResources } from '../utils/offlineCache';
import { StudentProfile } from '../utils/studentStorage';

interface DashboardViewProps {
  onBack: () => void;
  onOpenHistory?: (type: 'evaluations' | 'counselor') => void;
  onOpenOfflineCache?: () => void;
  studentProfile?: StudentProfile | null;
  onEditProfile?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onBack, 
  onOpenHistory, 
  onOpenOfflineCache,
  studentProfile,
  onEditProfile
}) => {
  const evalCount = getEvaluationHistory().length;
  const counselorCount = getCounselorHistory().length;
  const cachedCount = getCachedResources().length;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 max-w-2xl mx-auto p-4 space-y-4 overflow-y-auto font-sans transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white font-heading">
            📊 Tableau de Bord & Profil
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Vos statistiques de révision, réglages et accomplissements
          </p>
        </div>
      </div>

      {/* Student Profile Identity Card */}
      {studentProfile && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              <span>Fiche d'Identification Élève</span>
            </h3>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center gap-1 transition-all cursor-pointer font-heading"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-black uppercase text-slate-400 font-heading block mb-0.5">
                Nom & Prénoms
              </span>
              <p className="text-xs font-black text-slate-900 dark:text-white font-heading truncate">
                {studentProfile.fullName}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-black uppercase text-slate-400 font-heading block mb-0.5">
                Niveau d'Étude
              </span>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-heading truncate">
                {studentProfile.grade}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-black uppercase text-slate-400 font-heading block mb-0.5">
                Établissement
              </span>
              <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-heading truncate">
                {studentProfile.school}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-md border border-orange-400/30">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-6 h-6 text-yellow-300" />
            <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded-md">Assiduité</span>
          </div>
          <p className="text-2xl font-black font-heading">5 Jours</p>
          <p className="text-[11px] text-orange-100 mt-0.5">Série en cours 🔥</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 rounded-2xl shadow-md border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded-md">Quiz</span>
          </div>
          <p className="text-2xl font-black font-heading">18 Réussis</p>
          <p className="text-[11px] text-emerald-100 mt-0.5">Taux de succès: 89%</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-md border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-yellow-300" />
            <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded-md">Rang</span>
          </div>
          <p className="text-2xl font-black font-heading">Major 🥇</p>
          <p className="text-[11px] text-blue-100 mt-0.5">Niveau 3ème - Abidjan</p>
        </div>
      </div>

      {/* Persistent History Archives Access Card */}
      {onOpenHistory && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-slate-800 font-heading flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-emerald-600" />
              <span>Archives Permanentes (Hors-ligne)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              Sauvegarde Locale
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenHistory('evaluations')}
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 font-heading group-hover:text-emerald-950">
                    Historique Évaluations
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {evalCount} épreuve{evalCount > 1 ? 's' : ''} archivée{evalCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button
              onClick={() => onOpenHistory('counselor')}
              className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 font-heading group-hover:text-emerald-950">
                    Historique Conseiller
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {counselorCount} conseil{counselorCount > 1 ? 's' : ''} archivé{counselorCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>

          {onOpenOfflineCache && (
            <button
              onClick={onOpenOfflineCache}
              className="w-full mt-2 p-3.5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-heading text-white flex items-center gap-1.5">
                    <span>Cache Hors-Ligne (Données Téléchargées)</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md font-extrabold uppercase">SANS INTERNET</span>
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    {cachedCount} cours & fiche{cachedCount > 1 ? 's' : ''} disponible{cachedCount > 1 ? 's' : ''} hors-ligne
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      )}

      {/* Badges List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-slate-800 font-heading flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Mes Badges Obtenus</span>
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            2 / 4 Débloqués
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INITIAL_BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-r from-orange-50/50 to-emerald-50/50 border-orange-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <span className="text-3xl p-2 bg-white rounded-xl shadow-xs border border-slate-100 shrink-0">
                {badge.icon}
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 font-heading flex items-center gap-1">
                  <span>{badge.title}</span>
                  {badge.unlocked && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">Débloqué</span>}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
