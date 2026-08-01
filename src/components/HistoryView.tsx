import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Clock, 
  FileSpreadsheet, 
  Zap, 
  Compass, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Calendar,
  GraduationCap,
  Layers,
  Archive,
  BookOpen,
  Download
} from 'lucide-react';
import { 
  getEvaluationHistory, 
  getCounselorHistory, 
  deleteEvaluationItem, 
  deleteCounselorItem, 
  clearAllEvaluationsHistory, 
  clearAllCounselorHistory,
  EvaluationHistoryItem,
  CounselorHistoryItem
} from '../utils/historyStorage';
import { generateDocumentPdf } from '../utils/pdfExporter';

interface HistoryViewProps {
  initialType?: 'evaluations' | 'counselor';
  onBack: () => void;
  onNewAssessmentClick?: () => void;
  onNewCounselorClick?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  initialType = 'evaluations',
  onBack,
  onNewAssessmentClick,
  onNewCounselorClick,
}) => {
  const [activeTab, setActiveTab] = useState<'evaluations' | 'counselor'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [evaluations, setEvaluations] = useState<EvaluationHistoryItem[]>(() => getEvaluationHistory());
  const [counselorLogs, setCounselorLogs] = useState<CounselorHistoryItem[]>(() => getCounselorHistory());
  
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);

  const handleDeleteSingleEval = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteEvaluationItem(id);
    setEvaluations(updated);
  };

  const handleDeleteSingleCounselor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteCounselorItem(id);
    setCounselorLogs(updated);
  };

  const handleDownloadEvalPdf = (item: EvaluationHistoryItem) => {
    const formattedContent = 
      `Sujet / Résumé de l'Épreuve :\n${item.summary}\n\n` +
      (item.feedback ? `Commentaire & Correction :\n${item.feedback}\n\n` : '') +
      `Note Obtenue : ${item.score || 'En cours d\'évaluation'}\n` +
      `Date de passage : ${item.date}`;

    generateDocumentPdf({
      title: item.title,
      subtitle: `Archive de devoir / évaluation (${item.grade})`,
      subject: item.subject,
      grade: item.grade,
      docType: item.type === 'devoir' ? 'devoir' : item.type === 'interrogation' ? 'interrogation' : 'examen',
      content: formattedContent,
    });
  };

  const handleDownloadCounselorPdf = (item: CounselorHistoryItem) => {
    const formattedContent = 
      `THÈME DE L'ENTRETIEN\n${item.topic}\n\n` +
      `BILAN ET SYNTHÈSE DU CONSEILLER\n${item.summary}\n\n` +
      (item.recommendations && item.recommendations.length > 0 
        ? `RECOMMANDATIONS PÉDAGOGIQUES\n${item.recommendations.map(r => `• ${r}`).join('\n')}\n\n` 
        : '') +
      `Conseiller Référent : ${item.counselorName}\n` +
      `Date : ${item.date}`;

    generateDocumentPdf({
      title: item.topic,
      subtitle: `Conseil d'Orientation & Méthodologie (${item.grade})`,
      subject: 'Orientation & Méthodes',
      grade: item.grade,
      docType: 'cours',
      content: formattedContent,
    });
  };

  const handleClearAll = () => {
    if (activeTab === 'evaluations') {
      const empty = clearAllEvaluationsHistory();
      setEvaluations(empty);
    } else {
      const empty = clearAllCounselorHistory();
      setCounselorLogs(empty);
    }
    setShowConfirmClearModal(false);
  };

  const filteredEvaluations = evaluations.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCounselorLogs = counselorLogs.filter(item =>
    item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-4 shadow-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95 cursor-pointer shrink-0"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-200 font-extrabold uppercase tracking-wider font-heading">
                <Archive className="w-3.5 h-3.5" />
                <span>Archives Permanentes</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-heading truncate leading-tight">
                {activeTab === 'evaluations' ? 'Historique des Évaluations' : 'Historique Conseiller Pédagogique'}
              </h1>
            </div>
          </div>

          {(activeTab === 'evaluations' ? evaluations.length > 0 : counselorLogs.length > 0) && (
            <button
              onClick={() => setShowConfirmClearModal(true)}
              className="flex items-center gap-1 text-xs font-bold bg-red-500/80 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
              title="Effacer tout l'historique"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vider l'historique</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs grid grid-cols-2 gap-1 font-heading">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'evaluations'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Évaluations ({evaluations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('counselor')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'counselor'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Conseiller ({counselorLogs.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'evaluations' ? 'Rechercher par matière, classe, type...' : 'Rechercher un conseil d\'orientation...'}
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs font-heading"
          />
        </div>

        {/* Informational banner about offline archive */}
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="font-medium leading-tight">
            Vos historiques sont <strong className="font-black text-emerald-950">archivés localement</strong> et conservés même après déconnexion.
          </p>
        </div>

        {/* TAB 1: EVALUATIONS HISTORY */}
        {activeTab === 'evaluations' && (
          <div className="space-y-3">
            {filteredEvaluations.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 font-heading">
                    Aucune évaluation archivée
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Effectuez vos interrogations et devoirs chronométrés pour constituer votre historique.'}
                  </p>
                </div>
                {onNewAssessmentClick && !searchQuery && (
                  <button
                    onClick={onNewAssessmentClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-heading"
                  >
                    Lancer une épreuve maintenant
                  </button>
                )}
              </div>
            ) : (
              filteredEvaluations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase font-heading ${
                        item.type === 'interrogation'
                          ? 'bg-orange-100 text-orange-800'
                          : item.type === 'devoir'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type === 'interrogation' ? '⚡ Interrogation 15 min' : item.type === 'devoir' ? '📝 Devoir 45 min' : '🧩 Quiz'}
                      </span>

                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                        {item.subject}
                      </span>

                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                        {item.grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDownloadEvalPdf(item)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        title="Télécharger cette épreuve/évaluation en PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSingleEval(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Supprimer cet archivage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 font-heading leading-tight">
                      {item.title}
                    </h3>
                    {item.score && (
                      <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-mono shrink-0 ml-2">
                        {item.score}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.summary}
                  </p>

                  {item.feedback && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{item.feedback}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.date}
                    </span>
                    {item.durationMinutes && (
                      <span className="font-mono text-slate-500 font-bold">
                        Durée: {item.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: COUNSELOR HISTORY */}
        {activeTab === 'counselor' && (
          <div className="space-y-3">
            {filteredCounselorLogs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 font-heading">
                    Aucun entretien d'orientation archivé
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Consultez le Conseiller Pédagogique pour obtenir et archiver des avis d\'orientation.'}
                  </p>
                </div>
                {onNewCounselorClick && !searchQuery && (
                  <button
                    onClick={onNewCounselorClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-heading"
                  >
                    Contacter le conseiller
                  </button>
                )}
              </div>
            ) : (
              filteredCounselorLogs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md uppercase font-heading">
                        Orientation
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                        Classe: {item.grade}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDownloadCounselorPdf(item)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        title="Télécharger cette fiche de conseil en PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSingleCounselor(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Supprimer cette fiche conseiller"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 font-heading leading-tight">
                    {item.topic}
                  </h3>

                  <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-1">
                    <div className="text-[11px] font-extrabold text-blue-900 font-heading">
                      Bilan & Synthèse :
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {item.recommendations && item.recommendations.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-black text-emerald-800 uppercase font-heading">
                        Recommandations du Conseiller :
                      </div>
                      <ul className="space-y-1">
                        {item.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.date}
                    </span>
                    <span className="text-slate-500 font-bold">
                      {item.counselorName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal to Clear All Items */}
      {showConfirmClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 font-heading">
                Supprimer tout l'historique ?
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Voulez-vous vraiment effacer tous les éléments archivés dans{' '}
                <strong className="text-slate-800 font-bold">
                  {activeTab === 'evaluations' ? 'l\'historique des évaluations' : 'l\'historique conseiller'}
                </strong> ? Cette action est définitive.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowConfirmClearModal(false)}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors font-heading cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleClearAll}
                className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-colors font-heading cursor-pointer"
              >
                Effacer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
