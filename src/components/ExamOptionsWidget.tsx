import React, { useState } from 'react';
import { Award, GraduationCap, School, CheckCircle, Sparkles, ArrowRight, Clock } from 'lucide-react';

export type ExamType = 'CEPE' | 'BEPC' | 'BAC';

interface ExamOptionsWidgetProps {
  selectedGrade: string;
  selectedSubject: string;
  onSelectExam: (exam: ExamType, promptText: string) => void;
  onUpdateGrade?: (suggestedGrade: string) => void;
}

export const ExamOptionsWidget: React.FC<ExamOptionsWidgetProps> = ({
  selectedGrade,
  selectedSubject,
  onSelectExam,
  onUpdateGrade,
}) => {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(() => {
    if (selectedGrade.includes('CM2')) return 'CEPE';
    if (selectedGrade.includes('3ème')) return 'BEPC';
    if (selectedGrade.includes('Tle')) return 'BAC';
    return null;
  });

  const examsConfig: Array<{
    id: ExamType;
    title: string;
    level: string;
    targetGrade: string;
    duration: string;
    description: string;
    color: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'CEPE',
      title: 'CEPE Blanc',
      level: 'Enseignement Primaire',
      targetGrade: 'CM2',
      duration: '1h 30 min',
      description: 'Certificat d\'Études Primaires Élémentaires (Dictée, Exploitation de texte, Mathématiques, Éveil milieu).',
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-orange-300',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900',
      icon: <School className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 'BEPC',
      title: 'BEPC Blanc',
      level: 'Premier Cycle (Collège)',
      targetGrade: '3ème',
      duration: '2h 00 min',
      description: 'Brevet d\'Études du Premier Cycle (Format officiel MENA Côte d\'Ivoire avec exercices d\'application et de réflexion).',
      color: 'from-blue-600 to-cyan-700',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'BAC',
      title: 'BAC Blanc',
      level: 'Second Cycle (Lycée)',
      targetGrade: 'Tle A / C / D',
      duration: '3h à 4h',
      description: 'Baccalauréat Général & Technologique (Sujet type Épreuve Nationale avec situation d\'évaluation et résolution de problèmes).',
      color: 'from-emerald-600 to-teal-800',
      borderColor: 'border-emerald-300',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const handleConfirmExam = (examId: ExamType) => {
    setSelectedExam(examId);

    const config = examsConfig.find(e => e.id === examId);
    if (config && onUpdateGrade && !selectedGrade.toLowerCase().includes(examId.toLowerCase())) {
      if (examId === 'CEPE') onUpdateGrade('CM2');
      if (examId === 'BEPC') onUpdateGrade('3ème');
      if (examId === 'BAC' && !selectedGrade.includes('Tle')) onUpdateGrade('Tle D');
    }

    const promptText = `[EXAMEN BLANC OFFICIEL - ${examId}]\nPropose un sujet complet d'Examen Blanc de ${examId} en ${selectedSubject} (Niveau ${config?.targetGrade || selectedGrade}).\n- Respecte le format officiel et la structure des épreuves nationales de la Direction des Examens et Concours (DECO / MENA Côte d'Ivoire).\n- Propose un sujet inédit comprenant l'entête officiel, la durée conseillée (${config?.duration}) et les consignes strictes aux candidats.\n- Ne donne PAS le corrigé immédiatement (invite l'élève à traiter le sujet).`;

    onSelectExam(examId, promptText);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase text-slate-800 font-heading flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Choisissez votre Examen Blanc :
          </span>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Épreuves conformes au programme MENA Côte d'Ivoire
          </p>
        </div>
        {selectedExam && (
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-mono">
            {selectedExam} Sélectionné
          </span>
        )}
      </div>

      {/* 3 Main Exam Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {examsConfig.map((exam) => {
          const isSelected = selectedExam === exam.id;
          return (
            <div
              key={exam.id}
              onClick={() => handleConfirmExam(exam.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                isSelected
                  ? `${exam.bgColor} ${exam.borderColor} ring-2 ring-emerald-500/30 shadow-sm`
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200/80">
                    {exam.icon}
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h3 className={`text-sm font-black font-heading ${exam.textColor}`}>
                      {exam.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 font-mono block mt-0.5">
                    Classe : {exam.targetGrade}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-snug line-clamp-2">
                  {exam.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {exam.duration}
                </span>

                <span className={`flex items-center gap-1 ${isSelected ? 'text-emerald-700 font-black' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  Lancer <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
