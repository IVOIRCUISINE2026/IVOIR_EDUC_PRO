import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Lightbulb, 
  HelpCircle, 
  MessageSquare, 
  GraduationCap, 
  Layers, 
  FileText,
  Copy,
  Check,
  Download,
  HardDrive,
  Eye,
  Maximize2
} from 'lucide-react';
import { GET_REVISION_CHAPTERS, RevisionChapter } from '../constants/revisionData';
import { SUBJECTS_LIST, GRADES_LIST } from '../constants/data';
import { generateDocumentPdf } from '../utils/pdfExporter';
import { saveResourceToCache, isResourceCached } from '../utils/offlineCache';
import { FichesReadingMode } from './FichesReadingMode';

interface FichesRevisionViewProps {
  selectedGrade: string;
  selectedSubject: string;
  onSelectGrade: (grade: string) => void;
  onSelectSubject: (subject: string) => void;
  onBackToHome: () => void;
  onStartChapterChat: (chapterTitle: string, initialQuestion?: string) => void;
}

export const FichesRevisionView: React.FC<FichesRevisionViewProps> = ({
  selectedGrade,
  selectedSubject,
  onSelectGrade,
  onSelectSubject,
  onBackToHome,
  onStartChapterChat,
}) => {
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [copiedChapterId, setCopiedChapterId] = useState<string | null>(null);
  const [cachedToastId, setCachedToastId] = useState<string | null>(null);
  const [readingChapter, setReadingChapter] = useState<RevisionChapter | null>(null);

  const chapters = GET_REVISION_CHAPTERS(selectedSubject, selectedGrade);

  const toggleExpand = (id: string) => {
    setExpandedChapterId(prev => (prev === id ? null : id));
  };

  const handleCacheChapter = (chapter: RevisionChapter) => {
    const formattedContent = 
      `I. SYNTHÈSE DU COURS\n${chapter.summary}\n\n` +
      `II. NOTIONS ET POINTS CLÉS\n${chapter.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
      (chapter.keyFormulasOrRules && chapter.keyFormulasOrRules.length > 0 
        ? `III. FORMULES ET RÈGLES D'OR\n${chapter.keyFormulasOrRules.map(f => `• ${f}`).join('\n')}\n\n` 
        : '') +
      `IV. CONSEIL POUR L'ÉPREUVE MENA\n${chapter.examTip}\n\n` +
      `V. QUESTION DE CONTRÔLE\n"${chapter.sampleQuestion}"`;

    saveResourceToCache({
      id: chapter.id,
      title: `Fiche : ${chapter.title}`,
      subtitle: `Chapitre ${chapter.number} — ${chapter.subtitle}`,
      type: 'fiche',
      subject: selectedSubject,
      grade: selectedGrade,
      content: formattedContent,
    });

    setCachedToastId(chapter.id);
    setTimeout(() => setCachedToastId(null), 2500);
  };

  const handleCopy = (chapter: RevisionChapter) => {
    const textToCopy = `📑 FICHE DE RÉVISION : ${chapter.title} (${selectedGrade} - ${selectedSubject})\n\n` +
      `📌 Synthèse :\n${chapter.summary}\n\n` +
      `💡 Points Clés :\n${chapter.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
      (chapter.keyFormulasOrRules ? `📐 Formules / Règles :\n${chapter.keyFormulasOrRules.map(f => `• ${f}`).join('\n')}\n\n` : '') +
      `🎓 Conseil Examen MENA :\n${chapter.examTip}\n\n` +
      `❓ Question Réflexe :\n${chapter.sampleQuestion}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedChapterId(chapter.id);
    setTimeout(() => setCopiedChapterId(null), 2000);
  };

  const handleDownloadChapterPdf = (chapter: RevisionChapter) => {
    handleCacheChapter(chapter);

    const formattedContent = 
      `I. SYNTHÈSE DU COURS\n${chapter.summary}\n\n` +
      `II. NOTIONS ET POINTS CLÉS\n${chapter.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
      (chapter.keyFormulasOrRules && chapter.keyFormulasOrRules.length > 0 
        ? `III. FORMULES ET RÈGLES D'OR\n${chapter.keyFormulasOrRules.map(f => `• ${f}`).join('\n')}\n\n` 
        : '') +
      `IV. CONSEIL POUR L'ÉPREUVE MENA\n${chapter.examTip}\n\n` +
      `V. QUESTION DE CONTRÔLE\n"${chapter.sampleQuestion}"`;

    generateDocumentPdf({
      title: `Fiche de Révision : ${chapter.title}`,
      subtitle: `Chapitre ${chapter.number} — ${chapter.subtitle}`,
      subject: selectedSubject,
      grade: selectedGrade,
      docType: 'fiche',
      content: formattedContent,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-4 shadow-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95 cursor-pointer shrink-0"
              title="Retour au menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-200 font-extrabold uppercase tracking-wider font-heading">
                <FileText className="w-3.5 h-3.5" />
                <span>Fiches de Révision</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-heading truncate leading-tight">
                Chapitres de {selectedSubject}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chapters.length > 0 && (
              <button
                onClick={() => setReadingChapter(chapters[0])}
                className="flex items-center gap-1.5 bg-amber-400 text-slate-950 hover:bg-amber-300 px-2.5 py-1 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-xs active:scale-95 font-heading"
                title="Lancer le mode lecture immersif"
              >
                <Eye className="w-4 h-4" />
                <span>Mode Lecture 📖</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/20 shrink-0 text-xs font-black">
              <span className="text-amber-300 font-heading">{selectedGrade}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Quick Subject & Grade Selector Switcher */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 font-heading uppercase tracking-wider">
            <span>Changer de Matière ou de Classe</span>
            <span className="text-emerald-700 font-bold">{chapters.length} Chapitres</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Subject Selector dropdown */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-600" />
                Matière :
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => onSelectSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-extrabold rounded-xl p-2.5 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 font-heading cursor-pointer truncate"
              >
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj.id} value={subj.name}>
                    {subj.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 bottom-2.5 pointer-events-none" />
            </div>

            {/* Grade Selector dropdown */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-orange-600" />
                Classe :
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => onSelectGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-extrabold rounded-xl p-2.5 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 font-heading cursor-pointer truncate"
              >
                {GRADES_LIST.map((gr) => (
                  <option key={gr} value={gr}>
                    {gr}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 bottom-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Intro banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3.5 rounded-2xl shadow-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-yellow-200 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold font-heading text-sm">
              Programme Officiel MENA — {selectedSubject} ({selectedGrade})
            </p>
            <p className="text-orange-100 font-medium mt-0.5 leading-relaxed">
              Cliquez sur un chapitre pour consulter sa fiche synthétique, ses formules et poser des questions directement à l'IA.
            </p>
          </div>
        </div>

        {/* List of Chapters */}
        <div className="space-y-3">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapterId === chapter.id;

            return (
              <div
                key={chapter.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                    : 'border-slate-200/90 shadow-sm hover:border-emerald-300'
                }`}
              >
                {/* Chapter Card Header */}
                <button
                  onClick={() => toggleExpand(chapter.id)}
                  className="w-full text-left p-4 flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 font-heading transition-colors ${
                      isExpanded
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-emerald-100'
                    }`}>
                      {chapter.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded-md font-heading uppercase">
                          Chapitre {chapter.number}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading leading-snug mt-1 group-hover:text-emerald-700 transition-colors">
                        {chapter.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                        {chapter.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'bg-emerald-100 text-emerald-700 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Expanded Fiche de Révision Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-in fade-in duration-200">
                    {/* 1. Synthèse */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 font-heading uppercase">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>Synthèse du cours</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setReadingChapter(chapter)}
                            className="flex items-center gap-1 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700 shadow-2xs"
                            title="Ouvrir en mode lecture immersif sans distraction"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-300" />
                            <span>Lecture 📖</span>
                          </button>

                          <button
                            onClick={() => handleCacheChapter(chapter)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-emerald-800 px-2 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200 transition-colors cursor-pointer border border-amber-300/80"
                            title="Conserver cette fiche en cache hors-ligne"
                          >
                            <HardDrive className="w-3.5 h-3.5 text-amber-700" />
                            <span>{cachedToastId === chapter.id ? 'Mise en cache !' : isResourceCached(chapter.id) ? 'En cache 💾' : 'Cache 💾'}</span>
                          </button>

                          <button
                            onClick={() => handleDownloadChapterPdf(chapter)}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 transition-colors cursor-pointer border border-emerald-300/60"
                            title="Télécharger cette fiche en PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => handleCopy(chapter)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            {copiedChapterId === chapter.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {chapter.summary}
                      </p>
                    </div>

                    {/* 2. Points Clés */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 font-heading uppercase">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Concepts & Notions Indispensables</span>
                      </div>
                      <ul className="space-y-1.5">
                        {chapter.keyPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 3. Formules ou Règles d'or */}
                    {chapter.keyFormulasOrRules && chapter.keyFormulasOrRules.length > 0 && (
                      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-3.5 rounded-xl shadow-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-200 font-heading uppercase">
                          <Lightbulb className="w-4 h-4 text-yellow-300" />
                          <span>Formules Clés & Règles d'or</span>
                        </div>
                        <div className="space-y-1.5">
                          {chapter.keyFormulasOrRules.map((rule, idx) => (
                            <div key={idx} className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-mono font-bold text-amber-100">
                              {rule}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Astuce Examen MENA */}
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-black font-heading uppercase text-amber-900">
                        <GraduationCap className="w-4 h-4 text-orange-600" />
                        <span>Conseil pour l'évaluation MENA</span>
                      </div>
                      <p className="font-medium leading-relaxed text-amber-950">
                        {chapter.examTip}
                      </p>
                    </div>

                    {/* 5. Question Réflexe */}
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-blue-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black font-heading uppercase text-blue-900">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span>Question type d'entraînement</span>
                      </div>
                      <p className="font-bold text-slate-800 italic bg-white/70 p-2 rounded-lg border border-blue-200/60">
                        "{chapter.sampleQuestion}"
                      </p>
                    </div>

                    {/* Interactive AI Chat trigger */}
                    <div className="pt-1">
                      <button
                        onClick={() => onStartChapterChat(
                          `${chapter.title} (${selectedGrade} - ${selectedSubject})`,
                          `Explique-moi en détail le chapitre "${chapter.title}" et donne-moi un exercice corrigé.`
                        )}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-heading cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 fill-white/20" />
                        <span>Révisez ce chapitre avec l'IA Ivoir'Educ</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Immersive Reading Mode Modal / Fullscreen */}
      {readingChapter && (
        <FichesReadingMode
          chapter={readingChapter}
          allChapters={chapters}
          subject={selectedSubject}
          grade={selectedGrade}
          onClose={() => setReadingChapter(null)}
          onSelectChapter={(chap) => setReadingChapter(chap)}
          onStartChapterChat={onStartChapterChat}
          onDownloadPdf={handleDownloadChapterPdf}
        />
      )}
    </div>
  );
};
