import React from 'react';
import { Home, BookOpen, ClipboardList, User } from 'lucide-react';

export type TabType = 'accueil' | 'cours' | 'evaluations' | 'profil';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'accueil' as TabType, label: 'Accueil', icon: Home },
    { id: 'cours' as TabType, label: 'Cours', icon: BookOpen },
    { id: 'evaluations' as TabType, label: 'Évaluations', icon: ClipboardList },
    { id: 'profil' as TabType, label: 'Profil', icon: User },
  ];

  return (
    <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-30 max-w-2xl mx-auto shadow-lg">
      <div className="flex items-center justify-around py-2 px-3">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-orange-500 font-extrabold'
                  : 'text-slate-600 hover:text-slate-800 font-semibold'
              }`}
            >
              <IconComponent className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5] text-orange-500' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] tracking-tight font-heading">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
