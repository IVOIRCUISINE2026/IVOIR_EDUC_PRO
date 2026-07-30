import React from 'react';
import { LayoutDashboard, FileText, BookOpen, CheckCircle, GraduationCap, Calculator, MessageSquare, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluationRecord, UserRole } from '../types';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface DashboardProps {
  evaluations: EvaluationRecord[];
  userRole: UserRole;
}

export default function Dashboard({ evaluations: localEvaluations, userRole }: DashboardProps) {
  const [adminEvaluations, setAdminEvaluations] = React.useState<EvaluationRecord[]>([]);

  React.useEffect(() => {
    if (userRole === "administrateur") {
      const q = query(collection(db, "evaluations"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const evals = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as EvaluationRecord[];
        setAdminEvaluations(evals);
      });
      return () => unsubscribe();
    }
  }, [userRole]);

  const evaluations = userRole === "administrateur" ? adminEvaluations : localEvaluations;
  const stats = [
    {
      title: "Évaluations",
      count: evaluations.filter(e => e.mode === "Interrogations et devoirs").length,
      icon: FileText,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      title: "Fiches de Révisions",
      count: evaluations.filter(e => e.mode === "Fiches de révisions").length,
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      title: "Corrections",
      count: evaluations.filter(e => e.mode === "Corrections des Évaluations").length,
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Examens Blancs",
      count: evaluations.filter(e => e.mode === "Examens Blancs").length,
      icon: GraduationCap,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      title: "Conseils",
      count: evaluations.filter(e => e.mode === "Parler à un Conseiller").length,
      icon: MessageSquare,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      title: "Badges Gagnés",
      count: [
        evals => evals.length >= 1,
        evals => evals.filter(e => e.mode === "Fiches de révisions").length >= 5,
        evals => evals.filter(e => e.mode === "Interrogations et devoirs").length >= 5,
        evals => evals.filter(e => e.mode === "Examens Blancs").length >= 3,
        evals => evals.filter(e => e.mode === "Corrections des Évaluations").length >= 5,
        evals => new Set(evals.map(e => e.mode)).size >= 4
      ].filter(check => check(evaluations)).length,
      icon: Award,
      color: "text-yellow-500",
      bg: "bg-yellow-50"
    }
  ];

  // Group by subject
  const subjectStats = evaluations.reduce((acc, curr) => {
    acc[curr.subject] = (acc[curr.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSubjects = Object.entries(subjectStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-4 space-y-6 max-w-[400px] mx-auto">
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {userRole === "administrateur" ? "Dashboard Admin" : "Tableau de Bord"}
          </h2>
          <p className="text-[10px] text-slate-500">
            {userRole === "administrateur" 
              ? "Suivi global de l'activité" 
              : "Récapitulatif de vos activités"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {stats.slice(0, 3).map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-500">{stat.title}</p>
                  <p className="text-lg font-black text-slate-800">{stat.count}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Top Matières
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {sortedSubjects.length > 0 ? (
              <div className="space-y-3">
                {sortedSubjects.map(([subject, count]) => (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-medium text-slate-700">{subject}</span>
                      <span className="text-slate-500 font-bold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${(count / evaluations.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-slate-400 text-[10px]">Aucune donnée.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold">Continuez !</h3>
              <p className="text-orange-100 text-[9px]">L'excellence au service de la réussite.</p>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black">{evaluations.length}</div>
              <div className="text-[8px] font-bold uppercase tracking-widest opacity-80">Activités</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
