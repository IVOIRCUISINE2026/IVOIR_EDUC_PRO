import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Bot, User, Sparkles, Volume2, Copy, Check, RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import { ChatMessage, LearningMode } from '../types';

interface ChatViewProps {
  selectedGrade: string;
  selectedSubject: string;
  selectedMode: LearningMode;
  onBackToHome: () => void;
  onOpenGradeModal: () => void;
  onOpenSubjectModal: () => void;
  onOpenModeModal: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  selectedGrade,
  selectedSubject,
  selectedMode,
  onBackToHome,
  onOpenGradeModal,
  onOpenSubjectModal,
  onOpenModeModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Welcome message initialization
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'model',
          text: `Bonjour ! Je suis votre assistant pédagagique **Ivoir'Educ PRO**.\n\nVous étudiez actuellement en **${selectedGrade}** en **${selectedSubject}** (Mode: **${selectedMode}**).\n\nComment puis-je vous aider aujourd'hui ? Vous pouvez me poser une question, m'envoyer la photo d'un exercice ou demander une fiche de révision !`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [selectedGrade, selectedSubject, selectedMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type || 'image/png',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() && !attachedFile) return;

    const userMsgId = 'usr-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: promptText,
      timestamp: Date.now(),
      fileName: attachedFile?.name,
      fileDataUrl: attachedFile ? `data:${attachedFile.mimeType};base64,${attachedFile.data}` : undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);

    const modelMsgId = 'mod-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          grade: selectedGrade,
          subject: selectedSubject,
          mode: selectedMode,
          fileData: currentFile,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de réseau ou serveur.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  fullText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === modelMsgId ? { ...msg, text: fullText } : msg
                    )
                  );
                }
              } catch {
                // Ignore parse error on partial lines
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? {
                ...msg,
                text: "Désolé, une erreur s'est produite lors de la connexion. Veuillez vérifier votre clé API ou réessayer.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
        utterance.lang = 'fr-FR';
        utterance.onend = () => setSpeakingId(null);
        window.speechSynthesis.speak(utterance);
        setSpeakingId(id);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-2xl mx-auto shadow-sm">
      {/* Top Session Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex items-center justify-between gap-2 shadow-2xs">
        <button
          onClick={onBackToHome}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Retour à l'accueil"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Selected Params Pill Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none min-w-0">
          <button
            onClick={onOpenGradeModal}
            className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-black px-2.5 py-1 rounded-lg shrink-0 transition-colors"
          >
            🎓 {selectedGrade}
          </button>
          <button
            onClick={onOpenSubjectModal}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-2.5 py-1 rounded-lg shrink-0 transition-colors"
          >
            📚 {selectedSubject}
          </button>
          <button
            onClick={onOpenModeModal}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-black px-2.5 py-1 rounded-lg shrink-0 transition-colors max-w-[120px] truncate"
          >
            ⚙️ {selectedMode}
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-emerald-800/5 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Raccourcis :
        </span>
        <button
          onClick={() => handleSend(`Propose-moi un exercice type examen de ${selectedSubject} pour la classe de ${selectedGrade} avec correction.`)}
          className="text-xs bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-full shrink-0 font-medium hover:border-emerald-300 transition-all shadow-2xs"
        >
          📝 Générer un sujet d'exercice
        </button>
        <button
          onClick={() => handleSend(`Fais-moi une fiche de révision complète sur le chapitre principal de ${selectedSubject} en ${selectedGrade}.`)}
          className="text-xs bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-full shrink-0 font-medium hover:border-emerald-300 transition-all shadow-2xs"
        >
          📑 Fiche de révision du chapitre
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser ? 'bg-orange-500 text-white' : 'bg-emerald-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-orange-500 text-white rounded-tr-xs shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.fileDataUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-h-48 bg-black/10">
                    <img src={msg.fileDataUrl} alt="Fichier joint" className="w-full h-auto object-contain" />
                  </div>
                )}

                <div className="whitespace-pre-wrap break-words font-sans">
                  {msg.text || (isLoading && !isUser ? "Analyse et rédaction en cours..." : "")}
                </div>

                {!isUser && msg.text && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1 text-slate-400">
                    <button
                      onClick={() => toggleSpeak(msg.text, msg.id)}
                      className="p-1 hover:text-emerald-600 rounded-md hover:bg-slate-50 transition-colors"
                      title="Écouter le message"
                    >
                      <Volume2 className={`w-4 h-4 ${speakingId === msg.id ? 'text-emerald-600 animate-pulse' : ''}`} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="p-1 hover:text-emerald-600 rounded-md hover:bg-slate-50 transition-colors"
                      title="Copier le texte"
                    >
                      {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview if uploaded */}
      {attachedFile && (
        <div className="px-4 py-2 bg-orange-50 border-t border-orange-200 flex items-center justify-between text-xs text-orange-900 font-medium">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="truncate">{attachedFile.name}</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 text-orange-700 hover:text-orange-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            title="Joindre une photo d'exercice"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Posez votre question en ${selectedSubject}...`}
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 placeholder:text-slate-400"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="p-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white transition-all shadow-md shadow-emerald-700/20 shrink-0 font-bold"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
