import React from 'react';
import { Award, Star, Zap, Target, Book, Shield, Trophy, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EvaluationRecord } from '../types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface BadgesProps {
  evaluations: EvaluationRecord[];
}

interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  check: (evals: EvaluationRecord[]) => boolean;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_step',
    title: 'Premier Pas',
    description: 'Complétez votre première activité sur IvoirEduc Pro.',
    icon: Star,
    color: 'text-yellow-500',
    check: (evals) => evals.length >= 1
  },
  {
    id: 'reviser',
    title: 'Réviseur Assidu',
    description: 'Consultez 5 fiches de révisions.',
    icon: Book,
    color: 'text-green-500',
    check: (evals) => evals.filter(e => e.mode === "Fiches de révisions").length >= 5
  },
  {
    id: 'eval_master',
    title: 'Maître des Devoirs',
    description: 'Générez 5 sujets d\'interrogations ou devoirs.',
    icon: Target,
    color: 'text-orange-500',
    check: (evals) => evals.filter(e => e.mode === "Interrogations et devoirs").length >= 5
  },
  {
    id: 'exam_ready',
    title: 'Candidat Sérieux',
    description: 'Préparez-vous avec 3 examens blancs.',
    icon: Trophy,
    color: 'text-red-500',
    check: (evals) => evals.filter(e => e.mode === "Examens Blancs").length >= 3
  },
  {
    id: 'correction_expert',
    title: 'Expert en Correction',
    description: 'Demandez 5 corrections détaillées.',
    icon: Shield,
    color: 'text-blue-500',
    check: (evals) => evals.filter(e => e.mode === "Corrections des Évaluations").length >= 5
  },
  {
    id: 'versatile',
    title: 'Élève Polyvalent',
    description: 'Utilisez au moins 4 modules différents.',
    icon: Zap,
    color: 'text-purple-500',
    check: (evals) => {
      const modes = new Set(evals.map(e => e.mode));
      return modes.size >= 4;
    }
  }
];

export default function Badges({ evaluations }: BadgesProps) {
  const earnedCount = BADGE_DEFINITIONS.filter(b => b.check(evaluations)).length;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mes Badges</h2>
            <p className="text-sm text-slate-500">Gagnez des récompenses en progressant dans vos études</p>
          </div>
        </div>
        <div className="bg-yellow-500 text-white px-6 py-3 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-yellow-500/20">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Badges Débloqués</span>
          <span className="text-3xl font-black">{earnedCount} / {BADGE_DEFINITIONS.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BADGE_DEFINITIONS.map((badge, idx) => {
          const isEarned = badge.check(evaluations);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn(
                "h-full border-slate-100 transition-all duration-500 relative overflow-hidden",
                isEarned ? "shadow-md border-yellow-200 bg-gradient-to-br from-white to-yellow-50/30" : "opacity-60 grayscale"
              )}>
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center relative",
                    isEarned ? "bg-white shadow-inner border-4 border-yellow-400" : "bg-slate-100 border-4 border-slate-200"
                  )}>
                    {isEarned ? (
                      <badge.icon className={cn("w-10 h-10", badge.color)} />
                    ) : (
                      <Lock className="w-8 h-8 text-slate-300" />
                    )}
                    
                    {isEarned && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border-2 border-dashed border-yellow-400/30 rounded-full"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className={cn(
                      "font-bold text-lg",
                      isEarned ? "text-slate-800" : "text-slate-400"
                    )}>
                      {badge.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {isEarned ? (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-[10px] uppercase font-bold px-3">
                      Débloqué
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                      Verrouillé
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
        <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="font-bold text-slate-700">Continuez à apprendre !</h3>
          <p className="text-sm text-slate-500">
            Chaque interaction avec IvoirEduc Pro vous rapproche de nouveaux badges. Relevez le défi et devenez un élève d'élite !
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-using the Badge component from UI
import { Badge } from '@/components/ui/badge';
