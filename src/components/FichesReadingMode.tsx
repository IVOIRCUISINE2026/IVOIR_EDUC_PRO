import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  MessageSquare, 
  Download, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  Lightbulb,
  GraduationCap,
  HelpCircle,
  Type
} from 'lucide-react';
import { RevisionChapter } from '../constants/revisionData';

interface FichesReadingModeProps {
  chapter: RevisionChapter;
  allChapters: RevisionChapter[];
  subject: string;
  grade: string;
  onClose: () => void;
  onSelectChapter: (chapter: RevisionChapter) => void;
  onStartChapterChat: (chapterTitle: string, initialQuestion?: string) => void;
  onDownloadPdf: (chapter: RevisionChapter) => void;
}

export type ReadingTheme = 'sepia' | 'dark' | 'light' | 'midnight';
export type TextSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export const FichesReadingMode: React.FC<FichesReadingModeProps> = ({
  chapter,
  allChapters,
  subject,
  grade,
  onClose,
  onSelectChapter,
  onStartChapterChat,
  onDownloadPdf,
}) => {
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('sepia');
  const [textSize, setTextSize] = useState<TextSize>('lg');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Stop speech when chapter changes or component unmounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [chapter.id]);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = `Chapitre ${chapter.number}. ${chapter.title}. ${chapter.subtitle}. Synthèse : ${chapter.summary}. Points clés : ${chapter.keyPoints.join('. ')}. Conseil examen : ${chapter.examTip}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'sm': return 'text-xs leading-relaxed';
      case 'base': return 'text-sm leading-relaxed';
      case 'lg': return 'text-base leading-loose';
      case 'xl': return 'text-lg leading-loose';
      case '2xl': return 'text-xl leading-loose';
      default: return 'text-base leading-loose';
    }
  };

  const getHeadingSizeClass = () => {
    switch (textSize) {
      case 'sm': return 'text-sm font-bold';
      case 'base': return 'text-base font-bold';
      case 'lg': return 'text-lg font-bold';
      case 'xl': return 'text-xl font-bold';
      case '2xl': return 'text-2xl font-bold';
      default: return 'text-lg font-bold';
    }
  };

  const getThemeContainerClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] selection:bg-[#e8d5b5]';
      case 'dark':
        return 'bg-slate-900 text-slate-100 selection:bg-emerald-900/60';
      case 'midnight':
        return 'bg-[#090d16] text-[#c3d1e8] selection:bg-[#1a253a]';
      case 'light':
      default:
        return 'bg-slate-50 text-slate-900 selection:bg-emerald-200';
    }
  };

  const getThemeCardClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#f4e4c1]/60 border-[#e5d0a6] text-[#332616]';
      case 'dark':
        return 'bg-slate-800/80 border-slate-700 text-slate-100';
      case 'midnight':
        return 'bg-[#121929] border-[#1e2a45] text-[#d6e3f8]';
      case 'light':
      default:
        return 'bg-white border-slate-200/90 text-slate-800';
    }
  };

  const getHeaderThemeClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#f4e4c1] border-[#e5d0a6] text-[#332616]';
      case 'dark':
        return 'bg-slate-800 border-slate-700 text-slate-100';
      case 'midnight':
        return 'bg-[#121929] border-[#1e2a45] text-[#d6e3f8]';
      case 'light':
      default:
        return 'bg-white border-slate-200 text-slate-800';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-200 ${getThemeContainerClass()}`}>
      {/* Top Floating Control Toolbar (Immersive Header) */}
      <header className={`px-4 py-3 border-b flex items-center justify-between gap-3 shadow-sm shrink-0 ${getHeaderThemeClass()}`}>
        {/* Left: Close & Chapter Info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer shrink-0"
            title="Quitter le mode lecture"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-75 font-heading">
              Mode Lecture • Chapitre {chapter.number}/{allChapters.length}
            </span>
            <h2 className="text-xs sm:text-sm font-black truncate font-heading">
              {chapter.title}
            </h2>
          </div>
        </div>

        {/* Center/Right: Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio TTS Speech Reader */}
          {'speechSynthesis' in window && (
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer text-xs font-bold ${
                isSpeaking 
                  ? 'bg-emerald-600 text-white animate-pulse shadow-sm' 
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
              }`}
              title="Lecture vocale du chapitre"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isSpeaking ? 'Arrêter' : 'Écouter'}</span>
            </button>
          )}

          {/* Text Size Control */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-0.5 border border-black/5 dark:border-white/10">
            <button
              onClick={() => {
                if (textSize === '2xl') setTextSize('xl');
                else if (textSize === 'xl') setTextSize('lg');
                else if (textSize === 'lg') setTextSize('base');
                else if (textSize === 'base') setTextSize('sm');
              }}
              disabled={textSize === 'sm'}
              className="px-2 py-1 text-xs font-black disabled:opacity-30 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
              title="Réduire la taille du texte"
            >
              A-
            </button>
            <span className="px-1 text-[11px] font-mono font-bold opacity-60">
              {textSize.toUpperCase()}
            </span>
            <button
              onClick={() => {
                if (textSize === 'sm') setTextSize('base');
                else if (textSize === 'base') setTextSize('lg');
                else if (textSize === 'lg') setTextSize('xl');
                else if (textSize === 'xl') setTextSize('2xl');
              }}
              disabled={textSize === '2xl'}
              className="px-2 py-1 text-xs font-black disabled:opacity-30 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
              title="Agrandir la taille du texte"
            >
              A+
            </button>
          </div>

          {/* Theme Selector */}
          <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-0.5 border border-black/5 dark:border-white/10">
            {(['sepia', 'dark', 'midnight', 'light'] as ReadingTheme[]).map((th) => (
              <button
                key={th}
                onClick={() => setReadingTheme(th)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                  readingTheme === th ? 'bg-emerald-600 text-white shadow-2xs' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {th === 'sepia' ? 'Sepia 📜' : th === 'dark' ? 'Sombre 🌙' : th === 'midnight' ? 'Nuit 🌌' : 'Clair ☀️'}
              </button>
            ))}
          </div>

          {/* PDF Download */}
          <button
            onClick={() => onDownloadPdf(chapter)}
            className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            title="Télécharger la fiche en PDF"
          >
            <Download className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div className="w-full bg-black/10 dark:bg-white/10 h-1">
        <div 
          className="bg-emerald-500 h-1 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / allChapters.length) * 100}%` }}
        />
      </div>

      {/* Main Focus Reading Container */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          
          {/* Chapter Banner Title Header */}
          <div className="text-center space-y-2 border-b border-black/10 dark:border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-700 text-white">
              <span>{subject} • {grade}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight leading-tight">
              Chapitre {chapter.number} : {chapter.title}
            </h1>
            <p className="text-sm font-medium opacity-80 max-w-xl mx-auto">
              {chapter.subtitle}
            </p>
          </div>

          {/* I. Synthèse du cours */}
          <section className="space-y-3">
            <h3 className={`font-black font-heading uppercase flex items-center gap-2 ${getHeadingSizeClass()}`}>
              <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>I. Synthèse du cours</span>
            </h3>
            <div className={`p-5 rounded-2xl border ${getThemeCardClass()} ${getTextSizeClass()} font-medium`}>
              {chapter.summary}
            </div>
          </section>

          {/* II. Concepts & Notions Indispensables */}
          <section className="space-y-3">
            <h3 className={`font-black font-heading uppercase flex items-center gap-2 ${getHeadingSizeClass()}`}>
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span>II. Concepts & Notions Indispensables</span>
            </h3>
            <div className={`p-5 rounded-2xl border ${getThemeCardClass()} space-y-3`}>
              {chapter.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2.5" />
                  <p className={`${getTextSizeClass()} font-medium`}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* III. Formules & Règles d'Or */}
          {chapter.keyFormulasOrRules && chapter.keyFormulasOrRules.length > 0 && (
            <section className="space-y-3">
              <h3 className={`font-black font-heading uppercase flex items-center gap-2 ${getHeadingSizeClass()}`}>
                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0" />
                <span>III. Formules Clés & Règles d'or</span>
              </h3>
              <div className="space-y-2">
                {chapter.keyFormulasOrRules.map((rule, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-800 font-mono font-bold shadow-sm text-sm sm:text-base">
                    {rule}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* IV. Conseil Examen MENA */}
          <section className="space-y-3">
            <h3 className={`font-black font-heading uppercase flex items-center gap-2 ${getHeadingSizeClass()}`}>
              <GraduationCap className="w-5 h-5 text-orange-600 shrink-0" />
              <span>IV. Conseil pour l'évaluation MENA</span>
            </h3>
            <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-950 dark:text-orange-200">
              <p className={`${getTextSizeClass()} font-semibold leading-relaxed`}>
                {chapter.examTip}
              </p>
            </div>
          </section>

          {/* V. Question de contrôle */}
          <section className="space-y-3">
            <h3 className={`font-black font-heading uppercase flex items-center gap-2 ${getHeadingSizeClass()}`}>
              <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <span>V. Question de contrôle</span>
            </h3>
            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200">
              <p className={`${getTextSizeClass()} font-bold italic`}>
                "{chapter.sampleQuestion}"
              </p>
            </div>
          </section>

          {/* Action to Ask AI */}
          <div className="pt-4 text-center">
            <button
              onClick={() => {
                onClose();
                onStartChapterChat(
                  `${chapter.title} (${grade} - ${subject})`,
                  `Bonjour ! Je viens d'étudier en mode lecture le chapitre "${chapter.title}". Peux-tu me poser 3 questions d'entraînement pour tester mes connaissances ?`
                );
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-heading active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>Tester mes connaissances avec l'IA →</span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Sticky Chapter Navigator */}
      <footer className={`px-4 py-3 border-t flex items-center justify-between gap-3 shrink-0 ${getHeaderThemeClass()}`}>
        <button
          onClick={() => prevChapter && onSelectChapter(prevChapter)}
          disabled={!prevChapter}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black disabled:opacity-30 disabled:cursor-not-allowed bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Chapitre Précédent</span>
        </button>

        <span className="text-xs font-black opacity-70">
          {currentIndex + 1} / {allChapters.length}
        </span>

        <button
          onClick={() => nextChapter && onSelectChapter(nextChapter)}
          disabled={!nextChapter}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black disabled:opacity-30 disabled:cursor-not-allowed bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer shadow-2xs"
        >
          <span className="hidden sm:inline">Chapitre Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
