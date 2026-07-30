import React, { useState, useEffect } from 'react';
import { Play, Search, ExternalLink, Video, BookOpen, Clock, Star, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CHAPTERS_DATA, GENERIC_CHAPTERS } from '../constants/curriculum';

interface VideoLesson {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  url: string;
  views: string;
  rating: number;
}

interface VideoLessonsProps {
  selectedGrade: string;
  selectedSubject: string;
}

export default function VideoLessons({ selectedGrade, selectedSubject }: VideoLessonsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lessons, setLessons] = useState<VideoLesson[]>([]);

  const getChapters = () => {
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

  const generateMockVideos = (query: string) => {
    const chapters = getChapters();
    const baseVideos: VideoLesson[] = chapters.map((chapter, index) => ({
      id: `vid-${index}`,
      title: `${chapter} - Cours complet (${selectedGrade})`,
      channel: "IvoirEduc Academy",
      duration: `${Math.floor(Math.random() * 15) + 10}:45`,
      thumbnail: `https://picsum.photos/seed/${selectedSubject}-${index}/400/225`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedSubject} ${selectedGrade} ${chapter}`)}`,
      views: `${(Math.random() * 50 + 10).toFixed(1)}k vues`,
      rating: 4.5 + Math.random() * 0.5
    }));

    if (query) {
      return baseVideos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
    }
    return baseVideos;
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      setLessons(generateMockVideos(searchQuery));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedGrade, selectedSubject, searchQuery]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-500" />
            Cours en Vidéo
          </h2>
          <p className="text-slate-500 font-medium">
            Explorez les leçons de <span className="text-blue-600">{selectedSubject}</span> pour le niveau <span className="text-blue-600">{selectedGrade}</span>.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Rechercher une leçon..." 
            className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Chapitres", value: getChapters().length, color: "blue" },
          { icon: Clock, label: "Heures de cours", value: "45h+", color: "orange" },
          { icon: Star, label: "Note moyenne", value: "4.8/5", color: "yellow" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                stat.color === "blue" ? "bg-blue-50 text-blue-500" :
                stat.color === "orange" ? "bg-orange-50 text-orange-500" :
                "bg-yellow-50 text-yellow-500"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-video bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : lessons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lessons.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                      <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none font-mono text-[10px]">
                    {video.duration}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{video.channel}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>{video.views}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {video.rating.toFixed(1)}
                    </div>
                  </div>
                  <Button 
                    className="w-full rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-none shadow-none font-bold text-xs gap-2"
                    onClick={() => window.open(video.url, '_blank')}
                  >
                    Regarder sur YouTube
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">Aucun résultat trouvé</h3>
            <p className="text-slate-500">Essayez de modifier votre recherche ou changez de chapitre.</p>
          </div>
          <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-xl">
            Effacer la recherche
          </Button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Info className="w-8 h-8 text-blue-600" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-blue-900">Pourquoi ces vidéos ?</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Nous avons sélectionné les meilleures ressources pédagogiques conformes au programme ivoirien (MENA). 
            Ces vidéos sont hébergées sur YouTube et sont gratuites pour tous les élèves.
          </p>
        </div>
        <Button className="md:ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-blue-600/20">
          Suggérer une vidéo
        </Button>
      </div>
    </div>
  );
}
