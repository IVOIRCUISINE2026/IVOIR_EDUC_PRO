import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Sparkles, Trash2, Download, History, Clock, Calendar, LayoutDashboard, Award, Info, Phone, Calculator, CheckCircle, FileCheck, LogOut, ChevronLeft, RotateCcw, ArrowDown, ChevronDown, FileText, PenTool, Brain, Video as VideoIcon, Eraser, RefreshCw, Printer, MessageSquare, Settings, Copy, ExternalLink, GraduationCap, ShieldCheck, Key, CalendarClock, Hash, PlusCircle, Volume2, Plus, X, Image as ImageIcon, Paperclip, BookOpen, Lock, ShieldAlert, Crown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LearningMode, ChatMessage, EvaluationRecord, UserRole, AccessCode } from '../types';
import { generateEducationalContent, generateEducationalContentStream, generateSpeech } from '../services/geminiService';
import { db, auth, signInWithGoogle, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CHAPTERS_DATA, GENERIC_CHAPTERS } from '../constants/curriculum';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import AverageCalculator from './AverageCalculator';
import Dashboard from './Dashboard';
import Badges from './Badges';
import VideoLessons from './VideoLessons';

interface MainContentProps {
  selectedGrade: string;
  selectedSubject: string;
  selectedMode: LearningMode;
  setSelectedMode: (mode: LearningMode) => void;
  onLogout: () => void;
  onReset: () => void;
  setIsSidebarOpen: (open: boolean) => void;
  userRole: UserRole;
}

export default function MainContent({ selectedGrade, selectedSubject, selectedMode, setSelectedMode, onLogout, onReset, setIsSidebarOpen, userRole }: MainContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChapter, setSelectedChapter] = useState<string>("1");
  const [selectedChapterTitle, setSelectedChapterTitle] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState<string | number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<string | number | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; data: string; type: string } | null>(null);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showCodeActionDialog, setShowCodeActionDialog] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [showCodeManager, setShowCodeManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pcmToWav = (pcmBase64: string, sampleRate: number = 24000) => {
    const binaryString = window.atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + len, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // channel count (1 = mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, len, true);

    const blob = new Blob([header, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  };

  const handlePlayAudio = async (text: string, id: string | number) => {
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      setIsAudioLoading(id);
      const lang = selectedSubject.toLowerCase().includes("anglais") ? "en" :
                   selectedSubject.toLowerCase().includes("espagnol") ? "es" :
                   selectedSubject.toLowerCase().includes("allemand") ? "de" : "fr";
      
      // Split text into manageable chunks for TTS if needed
      const maxChars = 800;
      const chunks = (text || "").match(new RegExp(`.{1,${maxChars}}(?=\\s|$)`, 'g')) || [(text || "").substring(0, maxChars)];
      
      let currentChunkIdx = 0;

      const playNextChunk = async () => {
        if (currentChunkIdx >= chunks.length) {
          setPlayingAudioId(null);
          setIsAudioLoading(null);
          return;
        }

        const base64 = await generateSpeech(chunks[currentChunkIdx], lang);
        if (base64 === "QUOTA_EXCEEDED") {
          setPlayingAudioId(null);
          setIsAudioLoading(null);
          alert("Quota audio quotidien atteint. Cette fonction sera de nouveau disponible demain. Vous pouvez continuer à utiliser le chat et le PDF.");
          return;
        }
        if (base64) {
          const audioUrl = pcmToWav(base64, 24000);
          
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          
          audioRef.current.src = audioUrl;
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentChunkIdx++;
            playNextChunk();
          };
          
          setIsAudioLoading(null);
          setPlayingAudioId(id);
          await audioRef.current.play();
        } else {
          setPlayingAudioId(null);
          setIsAudioLoading(null);
          alert("Désolé, l'audio n'a pas pu être généré.");
        }
      };

      playNextChunk();
    } catch (error) {
      console.error("Audio error:", error);
      setPlayingAudioId(null);
      setIsAudioLoading(null);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Fetch access codes
  useEffect(() => {
    if (showCodeManager) {
      const q = query(collection(db, "access_codes"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const codes = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as AccessCode[];
        setAccessCodes(codes);
        setAuthError(null);
      }, (error) => {
        const msg = handleFirestoreError(error, 'list', 'access_codes');
        setAuthError(msg);
      });
      return () => unsubscribe();
    }
  }, [showCodeManager]);

  const generateNewCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const now = Date.now();
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      
      await addDoc(collection(db, "access_codes"), {
        code,
        createdAt: now,
        expiresAt: now + oneYear,
        isUsed: false,
        usedByDeviceId: null
      });
    } catch (e) {
      console.error("Error generating code:", e);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const deleteAccessCode = (id: string) => {
    setSelectedCodeId(id);
    setShowCodeActionDialog(true);
  };

  const handleResetCode = async () => {
    if (!selectedCodeId) return;
    try {
      await updateDoc(doc(db, "access_codes", selectedCodeId), {
        isUsed: false,
        usedByDeviceId: null
      });
      setShowCodeActionDialog(false);
      setSelectedCodeId(null);
    } catch (e) {
      console.error("Error resetting code:", e);
    }
  };

  const handleDeleteCode = async () => {
    if (!selectedCodeId) return;
    try {
      await deleteDoc(doc(db, "access_codes", selectedCodeId));
      setShowCodeActionDialog(false);
      setSelectedCodeId(null);
    } catch (e) {
      console.error("Error deleting code:", e);
    }
  };

  const getChapters = () => {
    // Fallback logic for grades not explicitly defined in CHAPTERS_DATA
    const gradeData = CHAPTERS_DATA[selectedGrade];
    if (gradeData && gradeData[selectedSubject]) {
      return gradeData[selectedSubject];
    }

    return GENERIC_CHAPTERS[selectedSubject] || [
      "Chapitre 1: Introduction",
      "Chapitre 2: Concepts fondamentaux",
      "Chapitre 3: Approfondissement",
      "Chapitre 4: Applications pratiques",
      "Chapitre 5: Synthèse",
      "Chapitre 6: Exercices types",
      "Chapitre 7: Préparation examen",
      "Chapitre 8: Révisions finales"
    ];
  };

  useEffect(() => {
    const chapters = getChapters();
    setSelectedChapterTitle(chapters[parseInt(selectedChapter) - 1] || `Chapitre ${selectedChapter}`);
  }, [selectedChapter, selectedSubject]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerEnd, setShowTimerEnd] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'all' | 'timer' | 'reset' | string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setShowTimerEnd(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = (minutes: number) => {
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Load history from local storage
  useEffect(() => {
    const savedEvals = localStorage.getItem('ivoireduc_evals');
    if (savedEvals) setEvaluations(JSON.parse(savedEvals));
    
    const savedChat = localStorage.getItem('ivoireduc_chat');
    if (savedChat) setMessages(JSON.parse(savedChat));
  }, []);

  // Save chat to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ivoireduc_chat', JSON.stringify(messages));
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 5 Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          data: event.target?.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleSend = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim() && !attachedFile) return;
    
    if (!selectedGrade || !selectedSubject) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "⚠️ Veuillez d'abord sélectionner votre **Niveau Scolaire** et votre **Matière** dans la barre latérale.", 
        timestamp: Date.now() 
      }]);
      return;
    }

    // Validation pour les Examens Blancs
    if (selectedMode === "Examens Blancs") {
      const examGrades = ["CM2", "3ème", "Tle A", "Tle C", "Tle D"];
      if (!examGrades.includes(selectedGrade)) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `⚠️ Le mode **Examens Blancs** est réservé aux classes d'examen (CM2, 3ème, Terminale). Votre niveau actuel (${selectedGrade}) ne dispose pas d'examen national type CEPE, BEPC ou BAC.`, 
          timestamp: Date.now() 
        }]);
        return;
      }
    }

    const currentFileData = attachedFile ? { ...attachedFile } : null;
    const userMessage: ChatMessage = { 
      role: 'user', 
      text: messageText || (currentFileData ? `[Fichier attaché: ${currentFileData.name}]` : ""), 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);
    if (!customInput) setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    // Create a placeholder for the model response
    const modelMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: modelMessageId }]);

    try {
      const fullResponse = await generateEducationalContentStream(
        selectedMode,
        selectedGrade,
        selectedSubject,
        messageText || "Analyse ce fichier s'il te plaît.",
        messages,
        (chunkText) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'model') {
              lastMsg.text = chunkText;
            }
            return newMessages;
          });
        },
        selectedChapterTitle,
        currentFileData ? { data: currentFileData.data, mimeType: currentFileData.type } : undefined
      );

      // If it's an evaluation, revision sheet, or other recordable mode, save it to history
      const recordableModes: LearningMode[] = [
        "Interrogations et devoirs", 
        "Fiches de révisions", 
        "Corrections des Évaluations", 
        "Examens Blancs", 
        "Parler à un Conseiller"
      ];

      if (recordableModes.includes(selectedMode)) {
        const deviceId = localStorage.getItem('ivoireduc_device_id') || 'unknown';
        const newEval: EvaluationRecord = {
          id: Date.now().toString(),
          deviceId,
          mode: selectedMode,
          grade: selectedGrade,
          subject: selectedSubject,
          content: fullResponse || '',
          timestamp: Date.now()
        };
        const updatedEvals = [newEval, ...evaluations];
        setEvaluations(updatedEvals);
        localStorage.setItem('ivoireduc_evals', JSON.stringify(updatedEvals));

        // Sync with Firebase
        try {
          await addDoc(collection(db, "evaluations"), {
            ...newEval,
            role: userRole,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Firebase sync error:", e);
        }
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'model') {
          lastMsg.text = "⚠️ Une erreur technique est survenue lors de la connexion au serveur pédagogique. Veuillez vérifier votre connexion internet et réessayer.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget === 'all') {
      setMessages([]);
      localStorage.removeItem('ivoireduc_chat');
    } else if (deleteTarget === 'timer') {
      setTimeLeft(null);
      setIsTimerRunning(false);
    } else if (deleteTarget === 'reset') {
      onReset();
      setMessages([]);
      localStorage.removeItem('ivoireduc_chat');
      setTimeLeft(null);
      setIsTimerRunning(false);
    } else if (deleteTarget) {
      const updated = evaluations.filter(ev => ev.id !== deleteTarget);
      setEvaluations(updated);
      localStorage.setItem('ivoireduc_evals', JSON.stringify(updated));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const clearHistory = () => {
    setDeleteTarget('all');
    setShowDeleteConfirm(true);
  };

  const handleReset = () => {
    setDeleteTarget('reset');
    setShowDeleteConfirm(true);
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const generatePDF = async (content?: string, titleOverride?: string) => {
    if (isPrinting) return;
    
    console.log("Démarrage de la génération PDF...");
    setIsPrinting(true);
    
    try {
      // Vérification du contenu
      if (!content && messages.length === 0) {
        alert("Aucun contenu à exporter. Commencez une discussion pour générer du contenu.");
        setIsPrinting(false);
        setShowPrintConfirm(false);
        return;
      }

      // Petit délai pour laisser l'UI respirer
      await new Promise(resolve => setTimeout(resolve, 300));

      const pageTitle = titleOverride || `${selectedMode} - ${selectedSubject} - ${selectedGrade}`;
      const subtitle = `Niveau: ${selectedGrade} | IvoirEduc Pro - L'excellence au service de la réussite`;
      
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });

      // Configuration des fonts
      doc.setFont("helvetica", "bold");
      
      // --- HEADER ---
      // Logo textuel
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22); // Orange-500
      doc.text("IvoirEduc Pro", 20, 20);
      
      // Slogan
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("L'excellence éducative ivoirienne par l'IA", 20, 25);
      
      // Infos École / MENA Style
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text("RÉPUBLIQUE DE CÔTE D'IVOIRE", 190, 15, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Ministère de l'Éducation Nationale", 190, 20, { align: "right" });
      doc.text("et de l'Alphabétisation (MENA)", 190, 24, { align: "right" });
      
      // Ligne de séparation
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.8);
      doc.line(20, 30, 190, 30);
      
      // Titre du document
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text(pageTitle.toUpperCase(), 105, 45, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105); // Slate-600
      doc.text(subtitle, 105, 52, { align: "center" });

      if (selectedChapterTitle) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(249, 115, 22);
        doc.text(`Chapitre : ${selectedChapterTitle}`, 105, 58, { align: "center" });
      }

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(40, 63, 170, 63);

      // --- BODY CONTENT ---
      const tableData: any[][] = [];
      
      if (content) {
        // Nettoyage Markdown de base pour le texte
        const cleanContent = content
          .replace(/#{1,6}\s?/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ''))
          .replace(/`([^`]+)`/g, '$1');
          
        tableData.push([cleanContent]);
      } else {
        messages.forEach((msg) => {
          if (msg.text) {
            const roleLabel = msg.role === 'user' ? 'ÉLÈVE' : 'IVOIREDUC PRO';
            const cleanMsg = msg.text
              .replace(/#{1,6}\s?/g, '')
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .replace(/`([^`]+)`/g, '$1');
              
            tableData.push([{ content: `${roleLabel}:\n${cleanMsg}`, styles: { fontStyle: msg.role === 'user' ? 'bold' : 'normal', textColor: msg.role === 'user' ? [124, 58, 237] : [30, 41, 59] } }]);
          }
        });
      }

      // Utilisation du plugin autoTable de manière robuste
      const tableFunc = (autoTable as any).default || autoTable;
      tableFunc(doc, {
        startY: 70,
        head: [],
        body: tableData,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 6,
          overflow: 'linebreak',
          font: 'helvetica',
          textColor: [30, 41, 59],
          lineWidth: 0
        },
        columnStyles: {
          0: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20, bottom: 25 },
        didDrawPage: (data: any) => {
          // --- FOOTER ---
          const pageCount = doc.getNumberOfPages();
          const str = `Page ${pageCount}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          
          doc.text(str, data.settings.margin.left, pageHeight - 10);
          doc.text("IvoirEduc Pro - L'excellence au service de la réussite scolaire", 105, pageHeight - 10, { align: "center" });
          doc.text(`Le ${new Date().toLocaleDateString()}`, 190, pageHeight - 10, { align: "right" });
        }
      });

      // --- FILENAME & SAVE ---
      const safeFileName = (pageTitle || "document")
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever les accents
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 40);
      
      const fileName = `IvoirEduc_${safeFileName}.pdf`;
      
      // Utilisation du save natif de jsPDF qui est très stable
      doc.save(fileName);
      
      console.log("PDF généré et sauvegardé avec succès via doc.save().");
      setShowPrintConfirm(false);
    } catch (error) {
      console.error("Erreur critique PDF:", error);
      alert("Une erreur technique est survenue lors de la création du PDF. Veuillez essayer de copier-coller le texte si le problème persiste.");
    } finally {
      setIsPrinting(false);
    }
  };

  const renderHistory = (type: 'eval' | 'counselor') => {
    const filtered = evaluations.filter(e => 
      type === 'eval' 
        ? (e.mode === "Interrogations et devoirs" || e.mode === "Fiches de révisions" || e.mode === "Corrections des Évaluations" || e.mode === "Examens Blancs")
        : (e.mode === "Parler à un Conseiller")
    );

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
          <History className="w-12 h-12 opacity-20" />
          <p>Aucun historique disponible pour le moment.</p>
        </div>
      );
    }

    return (
      <div className="max-w-[400px] mx-auto p-2 space-y-2">
        {filtered.map(item => (
          <Card key={item.id} className="overflow-hidden border-slate-200 hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="p-2">
              <div className="flex justify-between items-start mb-0.5">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[8px] h-3 px-1 border-slate-100">{item.subject}</Badge>
                  <span className="text-[7px] text-slate-400 font-mono">ID:{(item.deviceId || "unknown").substring(0, 6)}</span>
                </div>
                <span className="text-[8px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="font-black text-[10px] mb-0.5 line-clamp-1 text-slate-800">{item.mode}</h3>
              <div className="text-[9px] text-slate-500 line-clamp-1 mb-2 leading-none opacity-70">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>
              <div className="flex justify-end gap-1">
                {(item.mode !== "Tableau de Bord" && 
                  item.mode !== "Mes Badges" && 
                  item.mode !== "Calcule des moyennes" &&
                  item.mode !== "Cours en vidéo") && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-5 px-1.5 text-[8px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      playingAudioId === item.id ? "text-orange-500" : "",
                      isAudioLoading === item.id ? "animate-pulse text-orange-400" : ""
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayAudio(item.content, item.id);
                    }}
                    disabled={isAudioLoading === item.id}
                  >
                    {isAudioLoading === item.id ? (
                      <Loader2 className="w-2 h-2 animate-spin" />
                    ) : (
                      <Volume2 className="w-2 h-2" />
                    )}
                    {isAudioLoading === item.id ? "..." : playingAudioId === item.id ? "Lecture" : "Audio"}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-1.5 text-[8px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    generatePDF(item.content, `${item.mode} - ${item.subject} (${item.grade})`);
                  }}
                >
                  <Download className="w-2 h-2" /> PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(item.id);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="w-2 h-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (selectedMode === "Historique des évaluations") return <ScrollArea className="flex-1 min-h-0">{renderHistory('eval')}</ScrollArea>;
    if (selectedMode === "Historique Conseiller") return <ScrollArea className="flex-1 min-h-0">{renderHistory('counselor')}</ScrollArea>;

    if (selectedMode === "Calcule des moyennes") {
      return (
        <ScrollArea className="flex-1 min-h-0">
          <AverageCalculator selectedGrade={selectedGrade} />
        </ScrollArea>
      );
    }

    if (selectedMode === "Tableau de Bord") {
      return (
        <ScrollArea className="flex-1 min-h-0">
          <Dashboard evaluations={evaluations} userRole={userRole} />
        </ScrollArea>
      );
    }

    if (selectedMode === "Mes Badges") {
      return (
        <ScrollArea className="flex-1 min-h-0">
          <Badges evaluations={evaluations} />
        </ScrollArea>
      );
    }

    if (selectedMode === "Cours en vidéo") {
      return (
        <ScrollArea className="flex-1 min-h-0">
          <VideoLessons selectedGrade={selectedGrade} selectedSubject={selectedSubject} />
        </ScrollArea>
      );
    }

    if (selectedMode === "Infos £ Créateur") {
      const currentOrigin = window.location.origin + window.location.pathname;
      const apprenticeUrl = `${currentOrigin}?role=apprenant`;
      const adminUrl = `${currentOrigin}?role=administrateur`;

      const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Lien copié dans le presse-papier !");
      };

      return (
        <ScrollArea className="flex-1 min-h-0 bg-slate-50/50">
          <div className="max-w-[400px] mx-auto p-4 py-8 space-y-12">
            {/* Creator Profile */}
            {!showCodeManager && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl">
                  <img 
                    src="https://picsum.photos/seed/jean-cyrille/200/200" 
                    alt="Jean Cyrille AHORET" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Jean Cyrille AHORET</h2>
                  <p className="text-green-600 font-bold uppercase tracking-widest text-sm">Fondateur & Créateur d'IvoirEduc Pro</p>
                </div>
                <p className="text-slate-600 max-w-lg leading-relaxed text-sm">
                  Passionné par l'éducation et la technologie, j'ai conçu IvoirEduc Pro pour offrir à chaque élève ivoirien un compagnon d'étude intelligent, conforme au programme national et accessible partout.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  <a 
                    href="https://wa.me/2250103697499" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl font-bold hover:bg-green-100 transition-all border border-green-100 shadow-sm shadow-green-500/10"
                  >
                    <MessageSquare className="w-5 h-5" /> WhatsApp Business
                  </a>
                  <a 
                    href="tel:+2250704002387" 
                    className="flex items-center justify-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-2xl font-bold hover:bg-orange-100 transition-all border border-orange-100 shadow-sm shadow-orange-500/10"
                  >
                    <Phone className="w-5 h-5" /> Appeler le service
                  </a>
                </div>

                <div className="w-full max-w-lg pt-8 border-t border-slate-200">
                  <Button 
                    onClick={() => setShowCodeManager(true)}
                    className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black shadow-xl shadow-slate-200 gap-3 text-lg"
                  >
                    <Settings className="w-5 h-5" />
                    Gestion des Codes
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Code Manager View */}
            {showCodeManager && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCodeManager(false)}
                    className="flex items-center gap-2 text-slate-500 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back to Profile
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-800">Panel d'Administration</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestion des accès</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Deployment Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm p-4 bg-white rounded-2xl border-t-4 border-t-orange-500">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-orange-500 uppercase">Lien Public</span>
                          <span className="text-sm font-bold text-slate-800">Apprenants Standard</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 text-[8px]">Gratuit</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1 h-10 rounded-xl text-xs gap-2" onClick={() => copyToClipboard(apprenticeUrl)}>
                          <Copy className="w-3 h-3" /> Copier
                        </Button>
                        <Button variant="outline" className="h-10 w-10 rounded-xl" onClick={() => window.open(apprenticeUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>

                    <Card className="border-slate-200 shadow-sm p-4 bg-white rounded-2xl border-t-4 border-t-blue-600">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-600 uppercase">Lien Admin</span>
                          <span className="text-sm font-bold text-slate-800">Directeur / Admin</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 text-[8px]">Propriétaire</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1 h-10 rounded-xl text-xs gap-2" onClick={() => copyToClipboard(adminUrl)}>
                          <Copy className="w-3 h-3" /> Copier
                        </Button>
                        <Button variant="outline" className="h-10 w-10 rounded-xl" onClick={() => window.open(adminUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {/* Access Codes List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                          <Key className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight">Codes d'Accès Uniques</h3>
                          <p className="text-xs text-slate-500">Codes valides 12 mois pour 1 appareil</p>
                        </div>
                      </div>
                      <Button 
                        onClick={generateNewCode} 
                        disabled={isGeneratingCode}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 h-11 font-bold shadow-lg shadow-green-200 gap-2"
                      >
                        {isGeneratingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Générer
                      </Button>
                    </div>

                    <Card className="border-slate-100 overflow-hidden shadow-xl rounded-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Code</th>
                              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Appareil</th>
                              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Expire le</th>
                              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Statut</th>
                              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 bg-white">
                            {accessCodes.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 text-center">
                                  <code className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-mono font-bold text-sm border border-slate-200">
                                    {c.code}
                                  </code>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="text-[10px] text-slate-400 font-mono italic">
                                    {c.usedByDeviceId ? String(c.usedByDeviceId).substring(0, 12) + "..." : "Aucun"}
                                  </span>
                                </td>
                                <td className="p-4 text-xs text-slate-600 text-center font-bold">
                                  {new Date(c.expiresAt).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4 text-center">
                                  {c.isUsed ? (
                                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none font-bold uppercase text-[9px] px-2">Utilisé</Badge>
                                  ) : (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold uppercase text-[9px] px-2">Libre</Badge>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex justify-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => copyToClipboard(c.code)}>
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                      onClick={() => deleteAccessCode(c.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {accessCodes.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                  Aucun code d'accès généré pour le moment.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>

                  <div className="p-6 bg-slate-100 rounded-3xl flex gap-4 border border-white">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <CalendarClock className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">Règle de sécurité stricte</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Chaque code est unique et expire après 12 mois. Une fois utilisé, il est lié à l'empreinte matérielle de l'appareil de l'élève. En cas de changement d'appareil, l'administrateur doit réinitialiser le code.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      );
    }

    return (
      <>
        {/* Chat Area */}
        <ScrollArea className="flex-1 min-h-0 p-4 lg:p-8" ref={scrollRef}>
          <div className="space-y-8 pb-12">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-10 h-10 text-orange-500" />
                </motion.div>
                <div className="max-w-md space-y-4">
                  <h3 className="text-2xl font-bold text-orange-500">Bienvenue sur IvoirEduc Pro</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Une initiative de <span className="font-bold text-slate-900">Jean Cyrille AHORET</span> au service de l'excellence scolaire ivoirienne.
                  </p>
                  
                  {selectedGrade && selectedSubject && (
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Badge variant="outline" className="px-4 py-1.5 rounded-full border-orange-200 bg-orange-50 text-orange-700 font-bold flex items-center gap-2">
                        <Award className="w-3.5 h-3.5" />
                        Niveau: {selectedGrade}
                      </Badge>
                      <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 bg-blue-50 text-blue-700 font-bold flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5" />
                        Matière: {selectedSubject}
                      </Badge>
                      {selectedChapterTitle && (
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-green-200 bg-green-50 text-green-700 font-bold flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          Chapitre: {selectedChapterTitle}
                        </Badge>
                      )}
                    </div>
                  )}

                  {attachedFile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-auto mt-6 p-4 bg-white border-2 border-dashed border-orange-200 rounded-3xl shadow-sm flex items-center gap-4 max-w-xs"
                    >
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                        {attachedFile.type.startsWith('image/') ? (
                          <ImageIcon className="w-6 h-6 text-orange-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 truncate">{attachedFile.name}</span>
                        <span className="text-[10px] text-orange-500 font-bold uppercase">Fichier joint sélectionné</span>
                      </div>
                    </motion.div>
                  )}

                  <Separator className="bg-slate-100" />
                  <p className="text-slate-500 text-sm italic">
                    {selectedMode === "Questions Quiz"
                      ? "Testez vos connaissances avec une série de questions interactives sur le chapitre de votre choix."
                      : selectedMode === "Interrogations et devoirs" 
                      ? "Demandez-moi de générer un sujet d'interrogation ou un devoir sur un chapitre spécifique."
                      : selectedMode === "Corrections des Évaluations"
                      ? "Soumettez vos réponses ou demandez le corrigé détaillé d'un sujet généré précédemment."
                      : selectedMode === "Fiches de révisions"
                      ? "Obtenez des résumés détaillés et structurés de vos leçons pour réviser efficacement."
                      : selectedMode === "Examens Blancs"
                      ? "Préparez-vous aux examens nationaux (CEPE, BEPC, BAC) avec des sujets types officiels."
                      : selectedMode === "Parler à un Conseiller"
                      ? "Je suis votre conseiller d'orientation. Posez-moi vos questions sur votre avenir, vos difficultés ou vos choix de séries."
                      : "Posez vos questions d'orientation ou de méthodologie de travail."}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {selectedMode === "Questions Quiz" ? (
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-orange-200 hover:bg-orange-50 text-orange-700 h-10" onClick={() => handleSend("Génère un quiz de 5 questions sur le chapitre actuel")}>
                        Générer un Quiz (5 questions)
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-blue-200 hover:bg-blue-50 text-blue-700 h-10" onClick={() => handleSend("Génère un quiz de 10 questions sur le chapitre actuel")}>
                        Générer un Quiz (10 questions)
                      </Button>
                    </div>
                  ) : selectedMode === "Interrogations et devoirs" ? (
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-orange-200 hover:bg-orange-50 text-orange-700 h-10" onClick={() => handleSend("Génère une interrogation écrite de 15 minutes sur le dernier chapitre")}>
                        Générer une Interrogation (15 min)
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-green-200 hover:bg-green-50 text-green-700 h-10" onClick={() => handleSend("Génère un devoir de classe de 2 heures au format APC")}>
                        Générer un Devoir (2h)
                      </Button>
                      {messages.length > 0 && (
                        <Button 
                          className="rounded-full text-xs bg-slate-800 hover:bg-slate-900 text-white h-10 flex gap-2 items-center shadow-lg shadow-slate-200"
                          onClick={() => generatePDF()}
                        >
                          <Download className="w-4 h-4" />
                          Télécharger le sujet
                        </Button>
                      )}
                    </div>
                  ) : selectedMode === "Corrections des Évaluations" ? (
                    <>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-blue-200 hover:bg-blue-50 text-blue-700" onClick={() => handleSend("Propose-moi le corrigé type du dernier sujet généré")}>
                        Corrigé du dernier sujet
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-purple-200 hover:bg-purple-50 text-purple-700" onClick={() => handleSend("Aide-moi à corriger mes erreurs sur l'exercice précédent")}>
                        Analyser mes erreurs
                      </Button>
                    </>
                  ) : selectedMode === "Fiches de révisions" ? (
                    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sélectionnez un chapitre</span>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-none px-3 py-0.5 rounded-full text-[10px] font-bold">
                            {getChapters().length} Chapitres disponibles
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {getChapters().map((title, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedChapter((index + 1).toString())}
                              className={cn(
                                "p-3 rounded-xl text-[10px] font-bold transition-all text-left flex flex-col gap-1 border h-full",
                                selectedChapter === (index + 1).toString()
                                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]"
                                  : "bg-white text-slate-600 hover:bg-orange-50 hover:text-orange-500 border-slate-100"
                              )}
                            >
                              <span className={cn("opacity-60", selectedChapter === (index + 1).toString() ? "text-white" : "text-orange-500")}>
                                Chapitre {index + 1}
                              </span>
                              <span className="line-clamp-2 leading-tight">{title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                          className="rounded-xl px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 gap-2"
                          onClick={() => handleSend(`Génère un résumé complet et détaillé du chapitre "${selectedChapterTitle}" de ${selectedSubject} pour le niveau ${selectedGrade}. Inclus des illustrations pédagogiques (schémas ou images) pour faciliter la compréhension.`)}
                        >
                          <FileText className="w-4 h-4" />
                          Générer la Fiche de Révision
                        </Button>
                        {messages.length > 0 && (
                          <Button 
                            className="rounded-xl px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 gap-2"
                            onClick={() => generatePDF()}
                          >
                            <Download className="w-4 h-4" />
                            Télécharger la fiche
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          className="rounded-xl px-6 border-orange-200 text-orange-700 hover:bg-orange-50 font-bold gap-2"
                          onClick={() => handleSend(`Quels sont les points essentiels à retenir pour l'examen national en ${selectedSubject} pour le niveau ${selectedGrade} ?`)}
                        >
                          <Sparkles className="w-4 h-4" />
                          Points clés Examen
                        </Button>
                      </div>
                    </div>
                  ) : selectedMode === "Examens Blancs" ? (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md">
                      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 w-full">
                        <div className="p-2 bg-red-100 rounded-xl">
                          <FileCheck className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-red-800">Préparation aux Examens Nationaux</h4>
                          <p className="text-[11px] text-red-600 leading-relaxed">
                            Générez des sujets conformes aux formats officiels du {selectedGrade === "CM2" ? "CEPE" : selectedGrade === "3ème" ? "BEPC" : "BAC"}.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 w-full">
                        <Button 
                          className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 gap-2"
                          onClick={() => handleSend(`Génère un sujet complet d'examen blanc de ${selectedSubject} pour le niveau ${selectedGrade} (Format officiel ${selectedGrade === "CM2" ? "CEPE" : selectedGrade === "3ème" ? "BEPC" : "BAC"}).`)}
                        >
                          <PenTool className="w-4 h-4" />
                          Lancer l'Examen Blanc
                        </Button>
                        {messages.length > 0 && (
                          <Button 
                            className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 gap-2"
                            onClick={() => generatePDF()}
                          >
                            <Download className="w-4 h-4" />
                            Télécharger le sujet
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          className="w-full h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold gap-2"
                          onClick={() => handleSend(`Donne-moi des conseils méthodologiques spécifiques pour réussir l'épreuve de ${selectedSubject} au ${selectedGrade === "CM2" ? "CEPE" : selectedGrade === "3ème" ? "BEPC" : "BAC"}.`)}
                        >
                          <Brain className="w-4 h-4" />
                          Conseils Méthodologiques
                        </Button>
                      </div>
                    </div>
                  ) : selectedMode === "Parler à un Conseiller" ? (
                    <>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-purple-200 hover:bg-purple-50 text-purple-700" onClick={() => handleSend("Quelles sont les meilleures séries après la 3ème ?")}>
                        Orientation après la 3ème
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-blue-200 hover:bg-blue-50 text-blue-700" onClick={() => handleSend("J'ai des difficultés en mathématiques, comment m'améliorer ?")}>
                        Difficultés scolaires
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs border-green-200 hover:bg-green-50 text-green-700" onClick={() => handleSend("Quels sont les débouchés de ma série actuelle ?")}>
                        Débouchés professionnels
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleSend("Génère un sujet sur le dernier chapitre")}>
                        Générer un sujet type
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleSend("Quels sont les points clés à retenir ?")}>
                        Points clés du cours
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => handleSend("Comment réussir mon examen ?")}>
                        Conseils de réussite
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "rounded-2xl p-4 lg:p-6 shadow-sm transition-all",
                      msg.role === 'user' ? "max-w-[85%] bg-primary text-white rounded-tr-none" : 
                      cn(
                        "rounded-tl-none overflow-hidden",
                        (selectedMode === "Interrogations et devoirs" || 
                         selectedMode === "Fiches de révisions" || 
                         selectedMode === "Examens Blancs") 
                          ? "w-auto yellow-paper" 
                          : "max-w-[85%] bg-white border border-slate-100"
                      )
                    )}
                    style={(selectedMode === "Interrogations et devoirs" || 
                            selectedMode === "Fiches de révisions" || 
                            selectedMode === "Examens Blancs") && msg.role === 'model' ? { width: '10cm', maxWidth: '100%' } : {}}
                  >
                    <div className={cn(
                      "markdown-body",
                      msg.role === 'user' ? "text-white" : "text-slate-800"
                    )}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <div className={cn(
                      "mt-4 flex items-center justify-between gap-4",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className="text-[10px] opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      {msg.role === 'model' && msg.text && (
                        <div className="flex gap-2">
                          {/* Audio Option for all learning content */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "h-7 text-[10px] font-bold gap-1.5 rounded-full transition-all",
                              playingAudioId === idx 
                                ? "text-orange-500 bg-orange-50 animate-pulse" 
                                : "text-slate-400 hover:text-orange-500 hover:bg-orange-50",
                              isAudioLoading === idx ? "animate-pulse text-orange-400" : ""
                            )}
                            onClick={() => handlePlayAudio(msg.text, idx)}
                            disabled={isAudioLoading === idx}
                          >
                            {isAudioLoading === idx ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Volume2 className={cn("w-3 h-3", playingAudioId === idx && "fill-current")} />
                            )}
                            {isAudioLoading === idx ? "Chargement..." : playingAudioId === idx ? "Lecture..." : "Audio"}
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold gap-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                            onClick={() => generatePDF(msg.text, `${selectedMode} - ${selectedSubject}`)}
                          >
                            <Download className="w-3 h-3" /> PDF
                          </Button>
                          
                          {(selectedMode === "Interrogations et devoirs" || selectedMode === "Examens Blancs") && (
                            <>
                              {timeLeft === null && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 text-[10px] font-bold gap-1.5 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-full"
                                  onClick={() => {
                                    let duration = 30;
                                    if (selectedMode === "Examens Blancs") {
                                      duration = 120;
                                    } else if (msg.text.toLowerCase().includes("interrogation")) {
                                      duration = 15;
                                    } else if (msg.text.toLowerCase().includes("devoir")) {
                                      duration = 120;
                                    }
                                    startTimer(duration);
                                  }}
                                >
                                  <Clock className="w-3 h-3" /> Lancer le Chrono ({
                                    selectedMode === "Examens Blancs" ? "2h" : 
                                    msg.text.toLowerCase().includes("interrogation") ? "15min" :
                                    msg.text.toLowerCase().includes("devoir") ? "2h" : "30min"
                                  })
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[10px] font-bold gap-1.5 border-green-200 text-green-700 hover:bg-green-50 rounded-full"
                                onClick={() => {
                                  // Visual feedback
                                  const btn = document.activeElement as HTMLButtonElement;
                                  if (btn) {
                                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Sujet Validé';
                                    btn.classList.add('bg-green-50');
                                    btn.disabled = true;
                                  }
                                }}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Valider ce sujet
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[10px] font-bold gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full"
                                onClick={() => {
                                  setSelectedMode("Corrections des Évaluations");
                                  handleSend("Propose-moi le corrigé détaillé de ce sujet avec les explications pédagogiques.");
                                }}
                              >
                                <FileCheck className="w-3 h-3" />
                                Voir le corrigé
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-6 shadow-sm flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-slate-500 font-medium italic">IvoirEduc Pro réfléchit...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white border-t border-slate-100 relative">
          <div className="flex items-end justify-center gap-3 max-w-4xl mx-auto">
            <div className="relative flex-1 max-w-[8cm]">
              {attachedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute -top-16 left-0 right-0 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      {attachedFile.type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-orange-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-bold text-slate-800 truncate">{attachedFile.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Document prêt</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500" 
                    onClick={() => setAttachedFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={!selectedGrade || !selectedSubject ? "Sélectionnez d'abord un niveau et une matière" : "Écrivez votre message ici..."}
                disabled={isLoading || !selectedGrade || !selectedSubject}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[56px] max-h-32 rounded-2xl border-slate-200 focus:ring-primary focus:border-primary shadow-sm text-base py-4 resize-none w-full pr-14"
              />

              <Button
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !selectedGrade || !selectedSubject}
                className="absolute right-2 bottom-2 h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 z-10"
                title="Importer un fichier"
              >
                <Plus className="w-5 h-5" />
              </Button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,text/plain"
              />
            </div>
            
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !attachedFile) || !selectedGrade || !selectedSubject}
              className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex-shrink-0 flex items-center justify-center"
              title="Envoyer le message"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3">
            IvoirEduc Pro peut faire des erreurs. Vérifiez les informations importantes avec vos professeurs.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      {/* Top Taskbar */}
      <div className="p-4 lg:p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-3">
            {/* Grade Box */}
            <div className="px-3 py-1.5 rounded-lg border-2 border-orange-500 bg-orange-50 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">Niveau</span>
              <span className="text-sm font-bold text-orange-700">{selectedGrade}</span>
            </div>

            {/* Subject Box */}
            <div className="px-3 py-1.5 rounded-lg border-2 border-green-500 bg-green-50 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Matière</span>
              <span className="text-sm font-bold text-green-700">{selectedSubject}</span>
            </div>

            {/* Mode Box */}
            <div className="px-3 py-1.5 rounded-lg border-2 border-primary bg-blue-50 flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Option</span>
              <span className="text-sm font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-md">{selectedMode}</span>
            </div>

            {selectedChapterTitle && (
              <div className="px-3 py-1.5 rounded-lg border-2 border-purple-500 bg-purple-50 flex items-center gap-2 shadow-sm">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tighter">Chapitre</span>
                <span className="text-sm font-bold text-purple-700 truncate max-w-[150px]">{selectedChapterTitle}</span>
              </div>
            )}

            <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />

            {/* Back Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowReturnConfirm(true)}
              className="h-9 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-orange-500 transition-all gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-bold">Retour</span>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all animate-in fade-in zoom-in duration-300",
                timeLeft < 60 ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-orange-50 border-orange-500 text-orange-600"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-black font-mono">{formatTime(timeLeft)}</span>
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="ml-1 hover:opacity-70"
                >
                  {isTimerRunning ? <div className="w-2 h-2 bg-current rounded-sm" /> : <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-current ml-0.5" />}
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Réinitialiser le chrono ?")) {
                      setTimeLeft(null);
                      setIsTimerRunning(false);
                    }
                  }}
                  className="ml-1 hover:text-red-500"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Clock & Date Box */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border-2 border-slate-200 bg-slate-50 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold">
                  {currentTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors gap-2 h-9">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </Button>

            <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />

            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPrintConfirm(true)} 
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors gap-2 h-9"
                title="Télécharger en PDF"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer PDF</span>
            </Button>

            <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />

            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors gap-2 h-9">
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline">Effacer tout</span>
            </Button>

            <Separator orientation="vertical" className="h-6 bg-slate-200 hidden sm:block" />

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout} 
              className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors gap-2 h-9"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {renderContent()}

      {/* Timer End Notification */}
      <AnimatePresence>
        {showTimerEnd && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <Card className="max-w-sm w-full border-none shadow-2xl overflow-hidden">
              <div className="bg-red-500 p-6 flex justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800">Temps Écoulé !</h3>
                  <p className="text-slate-500">Votre session d'évaluation est terminée. Il est temps de passer à la correction.</p>
                </div>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/20"
                  onClick={() => {
                    setShowTimerEnd(false);
                    setTimeLeft(null);
                  }}
                >
                  Compris
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrintConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full"
            >
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-blue-50 p-6 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Printer className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">Téléchargement PDF</h3>
                    <p className="text-slate-500">
                      Voulez-vous télécharger le sujet de {selectedMode.toLowerCase()} au format PDF ?
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-bold"
                      onClick={() => setShowPrintConfirm(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 gap-2"
                      onClick={() => generatePDF()}
                      disabled={isPrinting}
                    >
                      {isPrinting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        "Télécharger"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCodeActionDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full"
            >
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-slate-800 p-6 flex justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Key className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">Action sur le Code</h3>
                    <p className="text-slate-500 text-sm">
                      Voulez-vous réinitialiser ce code (libérer l'appareil) ou le supprimer définitivement ?
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-200 gap-2"
                      onClick={handleResetCode}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Réinitialiser le Code
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 rounded-xl gap-2"
                      onClick={handleDeleteCode}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer le Code
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-slate-400 font-medium h-10 rounded-xl"
                      onClick={() => {
                        setShowCodeActionDialog(false);
                        setSelectedCodeId(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full"
            >
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-red-50 p-6 flex justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Eraser className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">
                      {deleteTarget === 'reset' ? "Confirmation de réinitialisation" : "Confirmation d'effacement"}
                    </h3>
                    <p className="text-slate-500">
                      {deleteTarget === 'all' 
                        ? "Voulez-vous vraiment effacer tout l'historique de discussion ? Cette action est irréversible."
                        : deleteTarget === 'timer'
                        ? "Voulez-vous vraiment réinitialiser le chronomètre ?"
                        : deleteTarget === 'reset'
                        ? "Voulez-vous vraiment réinitialiser l'application ? Cela effacera vos choix et votre historique."
                        : "Voulez-vous vraiment supprimer cet élément de l'historique ?"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-bold"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteTarget(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/20"
                      onClick={confirmDelete}
                    >
                      {deleteTarget === 'reset' ? "Réinitialiser" : "Effacer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Return Confirmation Modal */}
      <AnimatePresence>
        {showReturnConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full"
            >
              <Card className="border-none shadow-2xl overflow-hidden">
                <div className="bg-orange-50 p-6 flex justify-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <LogOut className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">Quitter la session</h3>
                    <p className="text-slate-500">
                      Souhaitez-vous quitter cette section ? Choisissez une option ci-dessous.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/20 gap-2"
                      onClick={() => {
                        onReset();
                        setMessages([]);
                        localStorage.removeItem('ivoireduc_chat');
                        setShowReturnConfirm(false);
                        if (window.innerWidth < 1024) setIsSidebarOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Sortir sans enregistrer
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-12 rounded-xl gap-2"
                      onClick={() => {
                        setSelectedMode("Interrogations et devoirs");
                        setShowReturnConfirm(false);
                        if (window.innerWidth < 1024) setIsSidebarOpen(true);
                      }}
                    >
                      <History className="w-4 h-4" />
                      Sortir et enregistrer
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-slate-400 font-medium h-10 rounded-xl"
                      onClick={() => setShowReturnConfirm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
