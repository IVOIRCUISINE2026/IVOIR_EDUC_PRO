import React from 'react';
import { ArrowLeft, Award, Flame, CheckCircle, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { INITIAL_BADGES } from '../constants/data';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-2xl mx-auto p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 font-heading">
            📊 Tableau de Bord & Badges
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Vos statistiques de révision et accomplissements
          </p>
        </div>
      </div>

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
