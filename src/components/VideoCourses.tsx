import React, { useState } from 'react';
import { ArrowLeft, Play, Clock, BookOpen, Search } from 'lucide-react';
import { SAMPLE_VIDEOS, SUBJECTS_LIST } from '../constants/data';
import { VideoCourse } from '../types';

interface VideoCoursesProps {
  onBack: () => void;
}

export const VideoCourses: React.FC<VideoCoursesProps> = ({ onBack }) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('Toutes');
  const [activeVideo, setActiveVideo] = useState<VideoCourse | null>(null);

  const filteredVideos = SAMPLE_VIDEOS.filter((v) =>
    selectedSubjectFilter === 'Toutes' ? true : v.subject === selectedSubjectFilter
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 font-heading">
            🎥 Cours en Vidéos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Explications visuelles par des professeurs certifiés
          </p>
        </div>
      </div>

      {/* Video Player Modal/Section if video active */}
      {activeVideo && (
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl text-white p-4 space-y-3">
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
              title={activeVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white font-heading">{activeVideo.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeVideo.subject} • {activeVideo.grade}
              </p>
            </div>
            <button
              onClick={() => setActiveVideo(null)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Subjects Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSubjectFilter('Toutes')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors ${
            selectedSubjectFilter === 'Toutes'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Toutes
        </button>
        {SUBJECTS_LIST.map((subj) => (
          <button
            key={subj.id}
            onClick={() => setSelectedSubjectFilter(subj.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors ${
              selectedSubjectFilter === subj.name
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {subj.name}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto flex-1 pr-1">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{video.duration}</span>
              </span>
            </div>

            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md font-heading">
                  {video.subject}
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {video.grade}
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-800 line-clamp-2 font-heading leading-snug">
                {video.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
