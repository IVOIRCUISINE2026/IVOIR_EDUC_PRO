import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Trash2, 
  FileText, 
  Download, 
  Search, 
  CheckCircle, 
  BookOpen, 
  Award, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  getCachedResources, 
  removeResourceFromCache, 
  clearAllOfflineCache, 
  CachedResource 
} from '../utils/offlineCache';
import { generateDocumentPdf } from '../utils/pdfExporter';

interface OfflineCacheViewProps {
  onBack: () => void;
  onOpenChatWithTopic?: (topic: string, subject: string, grade: string) => void;
}

export const OfflineCacheView: React.FC<OfflineCacheViewProps> = ({ onBack, onOpenChatWithTopic }) => {
  const [resources, setResources] = useState<CachedResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cours' | 'fiche' | 'examen' | 'interrogation'>('all');
  const [selectedResource, setSelectedResource] = useState<CachedResource | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    setResources(getCachedResources());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeResourceFromCache(id);
    setResources(updated);
    if (selectedResource?.id === id) {
      setSelectedResource(null);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Voulez-vous vraiment effacer tous les cours et fiches enregistrés en cache hors-ligne ?')) {
      const updated = clearAllOfflineCache();
      setResources(updated);
      setSelectedResource(null);
    }
  };

  const handleDownloadPdf = (resource: CachedResource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    generateDocumentPdf({
      title: resource.title,
      subtitle: resource.subtitle || `Ressource Pédagogique (${resource.grade})`,
      subject: resource.subject,
      grade: resource.grade,
      docType: resource.type,
      content: resource.content,
    });
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.grade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedFilter === 'all' || res.type === selectedFilter;
    return matchesSearch && matchesType;
  });

  const totalBytes = resources.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  const totalKb = (totalBytes / 1024).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-2xl mx-auto p-4 space-y-4 overflow-y-auto font-sans">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <span>💾 Cache & Ressources Hors-ligne</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium truncate">
            Cours et fiches accessibles sans connexion Internet
          </p>
        </div>

        {/* Online / Offline Status Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${
          isOnline 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">En Ligne</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Hors-Ligne (Mode Cache)</span>
            </>
          )}
        </div>
      </div>

      {/* Connection Mode Notice Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 p-3.5 rounded-2xl shadow-sm flex items-start gap-3 border border-amber-600">
          <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-black font-heading text-sm">Mode Hors-Ligne Actif</h4>
            <p className="font-medium opacity-90 leading-relaxed">
              Vous êtes actuellement déconnecté d'Internet. Vous pouvez consulter ci-dessous l'intégralité de vos cours, fiches de révision et sujets mis en cache.
            </p>
          </div>
        </div>
      )}

      {/* Storage & Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            Documents en Cache
          </span>
          <p className="text-xl font-black text-slate-900 font-heading">
            {resources.length} <span className="text-xs font-medium text-slate-500">ressources</span>
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
            Espace Utilisé
          </span>
          <p className="text-xl font-black text-slate-900 font-heading">
            {totalKb} <span className="text-xs font-medium text-slate-500">Ko</span>
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher un cours ou une fiche dans le cache..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Tout' },
            { id: 'fiche', label: 'Fiches de révision' },
            { id: 'cours', label: 'Cours complets' },
            { id: 'examen', label: 'Examens Blancs' },
            { id: 'interrogation', label: 'Interrogations/Devoirs' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedFilter(type.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === type.id
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}

          {resources.length > 0 && (
            <button
              onClick={handleClearCache}
              className="ml-auto text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl border border-red-200 shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider le cache</span>
            </button>
          )}
        </div>
      </div>

      {/* Resource Detail Reader View Modal/Overlay */}
      {selectedResource ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
                {selectedResource.type.toUpperCase()} • {selectedResource.subject} ({selectedResource.grade})
              </span>
              <h3 className="text-base font-black text-slate-900 font-heading mt-1">
                {selectedResource.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mise en cache le {selectedResource.cachedAt}
              </p>
            </div>
            <button
              onClick={() => setSelectedResource(null)}
              className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Fermer
            </button>
          </div>

          <div className="prose prose-slate max-w-none text-xs text-slate-800 leading-relaxed max-h-96 overflow-y-auto bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap font-mono">
            {selectedResource.content}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={(e) => handleDownloadPdf(selectedResource, e)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-yellow-300" />
              <span>Télécharger en PDF</span>
            </button>

            <button
              onClick={(e) => handleDeleteItem(selectedResource.id, e)}
              className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer du cache</span>
            </button>
          </div>
        </div>
      ) : (
        /* List of Cached Items */
        <div className="space-y-2.5">
          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 font-heading">
                  Aucun contenu en cache
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-1">
                  Les cours et fiches que vous consultez ou téléchargez en PDF seront automatiquement sauvegardés ici pour un accès sans Internet.
                </p>
              </div>
            </div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResource(res)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl text-xs font-bold ${
                      res.type === 'fiche' 
                        ? 'bg-amber-100 text-amber-800' 
                        : res.type === 'examen'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {res.type === 'fiche' ? <Layers className="w-4 h-4" /> : res.type === 'examen' ? <Award className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 font-heading group-hover:text-emerald-900 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {res.subject} • {res.grade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDownloadPdf(res, e)}
                      className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                      title="Exporter en PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(res.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Supprimer du cache"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2">
                  <span>Enregistré le {res.cachedAt}</span>
                  <span className="text-emerald-700 font-bold group-hover:underline">Consulter le cours →</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
