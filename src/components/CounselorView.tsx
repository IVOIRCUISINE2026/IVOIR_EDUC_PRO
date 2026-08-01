import React from 'react';
import { ArrowLeft, UserCheck, MessageSquare, PhoneCall, HelpCircle, Compass, Target, Archive } from 'lucide-react';

interface CounselorViewProps {
  onBack: () => void;
  onStartCounselorChat: (topic: string) => void;
  onViewHistory?: () => void;
}

export const CounselorView: React.FC<CounselorViewProps> = ({ onBack, onStartCounselorChat, onViewHistory }) => {
  const topics = [
    {
      title: 'Orientation Post-3ème ou Post-BAC',
      description: 'Choix entre 2nde A, C ou 1ère A, C, D ou filières universitaires',
      icon: Compass,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Méthodologie & Emploi du Temps',
      description: 'Créer un planning de révision efficace avant les examens',
      icon: Target,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Gestion du Stress & Confiance',
      description: 'Techniques pour aborder sereinement les épreuves écrites et orales',
      icon: HelpCircle,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-2xl mx-auto p-4 space-y-4">
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
            👨‍🏫 Conseiller Pédagogique
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Accompagnement, orientation et méthodologie de travail
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-yellow-300" />
            <h3 className="text-base font-black font-heading">Espace Conseil personnalisé</h3>
          </div>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-amber-300" />
              <span>Historique Archivé</span>
            </button>
          )}
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed">
          Posez vos questions d'orientation, demandez de l'aide pour votre méthode de travail ou discutez de vos ambitions académiques avec notre Conseiller IA certifié.
        </p>
      </div>

      {/* Quick Consultation Topics */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          Sujets de consultation fréquents :
        </h4>

        {topics.map((t, idx) => {
          const IconComp = t.icon;
          return (
            <button
              key={idx}
              onClick={() => onStartCounselorChat(t.title)}
              className="w-full text-left bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 group transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${t.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-sm font-extrabold text-slate-800 font-heading truncate">
                    {t.title}
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {t.description}
                  </p>
                </div>
              </div>
              <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
