import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  GraduationCap, 
  History, 
  FileText, 
  MessageSquare, 
  Settings, 
  ChevronRight,
  Menu,
  X,
  UserCircle,
  Calculator,
  PenTool,
  Globe,
  FlaskConical,
  Dna,
  Map,
  Brain,
  ShieldCheck,
  Languages,
  Phone,
  LayoutDashboard,
  Award,
  Info,
  CheckCircle,
  FileCheck,
  LogOut,
  Search,
  Video,
  HelpCircle,
  Trash2,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LearningMode, UserRole } from '../types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedMode: LearningMode;
  setSelectedMode: (mode: LearningMode) => void;
  onLogout: () => void;
  onReset: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole: UserRole;
  onOpenPremium?: () => void;
  isPremium?: boolean;
}

const grades = ["CM2", "6ème", "5ème", "4ème", "3ème", "2nde A", "2nde C", "1ère A", "1ère C", "1ère D", "Tle A", "Tle C", "Tle D"];
const subjects = [
  { name: "Mathématiques", icon: <Calculator className="w-4 h-4 text-blue-500" /> },
  { name: "Français", icon: <PenTool className="w-4 h-4 text-orange-500" /> },
  { name: "Anglais", icon: <Globe className="w-4 h-4 text-indigo-500" /> },
  { name: "Physique-Chimie", icon: <FlaskConical className="w-4 h-4 text-purple-500" /> },
  { name: "SVT", icon: <Dna className="w-4 h-4 text-green-500" /> },
  { name: "Histoire-Géographie", icon: <Map className="w-4 h-4 text-amber-500" /> },
  { name: "Philosophie", icon: <Brain className="w-4 h-4 text-rose-500" /> },
  { name: "EDHC", icon: <ShieldCheck className="w-4 h-4 text-sky-500" /> },
  { name: "Allemand", icon: <Languages className="w-4 h-4 text-red-500" /> },
  { name: "Espagnol", icon: <Languages className="w-4 h-4 text-yellow-500" /> }
];

const learningModes: { label: LearningMode; icon: React.ReactNode }[] = [
  { label: "Questions Quiz", icon: <HelpCircle className="w-4 h-4 text-yellow-500" /> },
  { label: "Interrogations et devoirs", icon: <BookOpen className="w-4 h-4 text-blue-500" /> },
  { label: "Corrections des Évaluations", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { label: "Historique des évaluations", icon: <History className="w-4 h-4 text-slate-500" /> },
  { label: "Fiches de révisions", icon: <FileText className="w-4 h-4 text-orange-500" /> },
  { label: "Calcule des moyennes", icon: <Calculator className="w-4 h-4 text-cyan-500" /> },
  { label: "Examens Blancs", icon: <FileCheck className="w-4 h-4 text-red-500" /> },
  { label: "Cours en vidéo", icon: <Video className="w-4 h-4 text-purple-500" /> },
  { label: "Tableau de Bord", icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" /> },
  { label: "Mes Badges", icon: <Award className="w-4 h-4 text-amber-500" /> },
  { label: "Parler à un Conseiller", icon: <MessageSquare className="w-4 h-4 text-pink-500" /> },
  { label: "Historique Conseiller", icon: <History className="w-4 h-4 text-gray-500" /> },
  { label: "Infos £ Créateur", icon: <Info className="w-4 h-4 text-teal-500" /> },
];

export default function Sidebar({
  selectedGrade,
  setSelectedGrade,
  selectedSubject,
  setSelectedSubject,
  selectedMode,
  setSelectedMode,
  onLogout,
  onReset,
  isOpen,
  setIsOpen,
  userRole,
  onOpenPremium,
  isPremium = false
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsOpen]);

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(subjectSearch.toLowerCase());
    if (!matchesSearch) return false;

    const isPhilo = s.name === "Philosophie";
    const isLanguage = ["Anglais", "Allemand", "Espagnol"].includes(s.name);
    const isSeniorLevel = selectedGrade.startsWith("1ère") || selectedGrade.startsWith("Tle");

    // CM2 doesn't do languages in this context
    if (selectedGrade === "CM2" && isLanguage) return false;

    if (isSeniorLevel) {
      // For 1ère and Tle, they do ALL subjects
      return true;
    } else {
      // Other levels do NOT do philosophy
      return !isPhilo;
    }
  });

  useEffect(() => {
    const isSeniorLevel = selectedGrade.startsWith("1ère") || selectedGrade.startsWith("Tle");
    const isLanguage = ["Anglais", "Allemand", "Espagnol"].includes(selectedSubject);
    
    if (!isSeniorLevel && selectedSubject === "Philosophie") {
      setSelectedSubject("Mathématiques");
    }
    
    if (selectedGrade === "CM2" && isLanguage) {
      setSelectedSubject("Mathématiques");
    }
  }, [selectedGrade, selectedSubject, setSelectedSubject]);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold"
            >
              I
            </motion.div>
            <h1 className="text-xl font-bold text-orange-500">IvoirEduc Pro</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Par Jean Cyrille AHORET</p>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 px-6 pb-8">
            {/* Option Premium Card */}
            {onOpenPremium && (
              <button
                type="button"
                onClick={onOpenPremium}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-orange-200 transition-all flex items-center justify-between group text-left cursor-pointer border border-amber-300/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
                    <Crown className="w-5 h-5 text-yellow-200 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black tracking-tight leading-none text-yellow-100 uppercase">
                      {isPremium ? "Option Premium" : "Option Premium"}
                    </p>
                    <p className="text-[10px] font-medium text-white/90 truncate mt-1">
                      Codes 12 Mois & Mobile Money
                    </p>
                  </div>
                </div>
                <Badge className="bg-white text-orange-600 hover:bg-white text-[9px] font-black shrink-0 px-2 py-0.5 rounded-lg shadow-xs">
                  {isPremium ? "ACTIF" : "3 000 F"}
                </Badge>
              </button>
            )}

            {/* Niveau Scolaire */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-orange-500 uppercase tracking-widest px-2">Niveau Scolaire</label>
              <Dialog>
                <DialogTrigger render={
                  <Button variant="outline" className="w-full justify-between font-medium hover:border-green-500 hover:text-green-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-orange-500" />
                      <span className={cn(selectedGrade ? "text-green-600" : "text-slate-600")}>{selectedGrade || "Choisir un niveau"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Button>
                } />
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Sélectionnez votre niveau</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-2 py-4">
                    {grades.map((grade) => (
                      <Button
                        key={grade}
                        variant={selectedGrade === grade ? "default" : "outline"}
                        onClick={() => setSelectedGrade(grade)}
                        className={cn(
                          "text-xs",
                          selectedGrade === grade ? "bg-green-600 hover:bg-green-700" : "hover:border-green-500 hover:text-green-600"
                        )}
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Separator className="bg-slate-100" />

            {/* Mode d'apprentissage */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-orange-500 uppercase tracking-widest px-2 mb-2 block">Mode d'apprentissage</label>
              {learningModes.filter(mode => {
                if (mode.label === "Examens Blancs") {
                  return ["CM2", "3ème", "Tle A", "Tle C", "Tle D"].includes(selectedGrade);
                }
                return true;
              }).map((mode) => (
                <Button
                  key={mode.label}
                  variant={selectedMode === mode.label ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 font-medium text-sm h-10 transition-all",
                    selectedMode === mode.label 
                      ? "bg-green-50 text-green-700 border-l-4 border-green-600 rounded-l-none" 
                      : "text-slate-600 hover:text-green-600 hover:bg-green-50/50"
                  )}
                  onClick={() => setSelectedMode(mode.label)}
                >
                  <span className="flex-shrink-0">
                    {mode.icon}
                  </span>
                  {mode.label}
                </Button>
              ))}
            </div>

            <Separator className="bg-slate-100" />

            {/* Matières */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 mb-2">
                <label className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">Matières</label>
                <Badge variant="outline" className="text-[9px] h-4 px-1">{filteredSubjects.length}</Badge>
              </div>
              
              {/* Subject Search */}
              <div className="px-2 mb-3">
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Filtrer les matières..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <Button
                    key={subject.name}
                    variant={selectedSubject === subject.name ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 font-medium text-sm h-10 transition-all",
                      selectedSubject === subject.name 
                        ? "bg-green-50 text-green-700 border-l-4 border-green-600 rounded-l-none" 
                        : "text-slate-600 hover:text-green-600 hover:bg-green-50/50"
                    )}
                    onClick={() => {
                      setSelectedSubject(subject.name);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <span className="flex-shrink-0">
                      {subject.icon}
                    </span>
                    {subject.name}
                  </Button>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-slate-400 italic">Aucune matière trouvée</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100">
          <div className="flex flex-col gap-3 px-3 py-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-orange-200">
                <img 
                  src="https://picsum.photos/seed/jean-cyrille/200/200" 
                  alt="Jean Cyrille AHORET" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-orange-500">Jean Cyrille AHORET</span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Créateur</span>
              </div>
            </div>
            
            <Separator className="bg-slate-200/50" />
            
            <div className="space-y-1.5">
              <a 
                href="https://wa.me/2250103697499" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-green-600 transition-colors group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center group-hover:border-green-200 group-hover:bg-green-50">
                  <MessageSquare className="w-3 h-3" />
                </div>
                WhatsApp: +225 01 03 69 74 99
              </a>
              <a 
                href="tel:+2250704002387" 
                className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-orange-500 transition-colors group"
              >
                <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center group-hover:border-orange-200 group-hover:bg-orange-50">
                  <Phone className="w-3 h-3" />
                </div>
                +225 07 04 00 23 87
              </a>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Logout Button */}
          <div className="px-2">
            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <DialogTrigger render={
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 font-bold text-sm h-11 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              } />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-5 h-5" />
                    Confirmer la déconnexion
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Comment souhaitez-vous quitter votre session d'apprentissage ?
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/20 gap-2"
                      onClick={() => {
                        onReset();
                        localStorage.removeItem('ivoireduc_chat');
                        onLogout();
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Sortir sans enregistrer
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-12 rounded-xl gap-2"
                      onClick={() => {
                        // Chat is already saved in localStorage via useEffect in MainContent
                        onLogout();
                      }}
                    >
                      <History className="w-4 h-4" />
                      Sortir et enregistrer
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-slate-400 font-medium h-10 rounded-xl"
                      onClick={() => setShowLogoutConfirm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
