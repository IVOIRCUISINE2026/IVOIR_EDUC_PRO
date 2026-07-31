import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { NiveauScolaireModal } from './components/NiveauScolaireModal';
import { ModeApprentissageView } from './components/ModeApprentissageView';
import { MatieresView } from './components/MatieresView';
import { ChatView } from './components/ChatView';
import { AverageCalculator } from './components/AverageCalculator';
import { VideoCourses } from './components/VideoCourses';
import { DashboardView } from './components/DashboardView';
import { CounselorView } from './components/CounselorView';
import { DesignerInfoModal } from './components/DesignerInfoModal';
import { BottomNav, TabType } from './components/BottomNav';
import { LearningMode } from './types';
import { isPhiloGrade } from './constants/data';

export default function App() {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);

  const [selectedGrade, setSelectedGrade] = useState<string>("3ème");
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathématiques");
  const [selectedMode, setSelectedMode] = useState<LearningMode>("Interrogations et devoirs");

  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'average' | 'videos' | 'dashboard' | 'counselor'>('home');

  // Modals
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showDesignerModal, setShowDesignerModal] = useState<boolean>(false);

  const handleSelectGrade = (g: string) => {
    setSelectedGrade(g);
    if (selectedSubject === 'Philosophie' && !isPhiloGrade(g)) {
      setSelectedSubject('Français');
    }
  };

  const handleLogoutAndSave = () => {
    localStorage.setItem('ivoireduc_saved_grade', selectedGrade);
    localStorage.setItem('ivoireduc_saved_subject', selectedSubject);
    localStorage.setItem('ivoireduc_last_logout', new Date().toISOString());
    setActiveView('home');
    setActiveTab('accueil');
    setShowWelcomeScreen(true);
  };

  const handleLogoutWithoutSave = () => {
    setActiveView('home');
    setActiveTab('accueil');
    setShowWelcomeScreen(true);
  };

  if (showWelcomeScreen) {
    return <WelcomeScreen onEnterApp={() => setShowWelcomeScreen(false)} />;
  }

  const handleSelectMode = (mode: LearningMode) => {
    setSelectedMode(mode);

    if (mode === 'Calcul de moyennes') {
      setActiveView('average');
    } else if (mode === 'Cours en vidéos') {
      setActiveView('videos');
    } else if (mode === 'Tableau de bord' || mode === 'Mes badges') {
      setActiveView('dashboard');
    } else if (mode === 'Parler à un Conseiller Pédagogique') {
      setActiveView('counselor');
    } else if (mode === 'Infos concepteur') {
      setShowDesignerModal(true);
    } else {
      setActiveView('chat');
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'accueil') {
      setActiveView('home');
    } else if (tab === 'cours') {
      setShowSubjectModal(true);
    } else if (tab === 'evaluations') {
      setShowModeModal(true);
    } else if (tab === 'profil') {
      setActiveView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans relative">
      {/* Top Header */}
      {activeView !== 'chat' && activeView !== 'average' && activeView !== 'videos' && (
        <Header
          onOpenMenu={() => setShowModeModal(true)}
          selectedGrade={selectedGrade}
          selectedSubject={selectedSubject}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 pb-16 overflow-y-auto">
        {activeView === 'home' && (
          <HomeScreen
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedMode={selectedMode}
            onOpenGradeSelect={() => setShowGradeModal(true)}
            onOpenModeSelect={() => setShowModeModal(true)}
            onOpenSubjectSelect={() => setShowSubjectModal(true)}
            onStartChat={() => setActiveView('chat')}
            onOpenDesignerInfo={() => setShowDesignerModal(true)}
            onLogoutAndSave={handleLogoutAndSave}
            onLogoutWithoutSave={handleLogoutWithoutSave}
          />
        )}

        {activeView === 'chat' && (
          <ChatView
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            selectedMode={selectedMode}
            onBackToHome={() => setActiveView('home')}
            onOpenGradeModal={() => setShowGradeModal(true)}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
            onOpenModeModal={() => setShowModeModal(true)}
          />
        )}

        {activeView === 'average' && (
          <AverageCalculator
            initialGrade={selectedGrade}
            onBack={() => setActiveView('home')}
          />
        )}

        {activeView === 'videos' && (
          <VideoCourses onBack={() => setActiveView('home')} />
        )}

        {activeView === 'dashboard' && (
          <DashboardView onBack={() => setActiveView('home')} />
        )}

        {activeView === 'counselor' && (
          <CounselorView
            onBack={() => setActiveView('home')}
            onStartCounselorChat={(topic) => {
              setSelectedMode('Parler à un Conseiller Pédagogique');
              setActiveView('chat');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />

      {/* Modals matching screenshot design */}
      {showGradeModal && (
        <NiveauScolaireModal
          selectedGrade={selectedGrade}
          onSelectGrade={handleSelectGrade}
          onClose={() => setShowGradeModal(false)}
        />
      )}

      {showModeModal && (
        <ModeApprentissageView
          selectedMode={selectedMode}
          onSelectMode={handleSelectMode}
          onClose={() => setShowModeModal(false)}
        />
      )}

      {showSubjectModal && (
        <MatieresView
          selectedSubject={selectedSubject}
          selectedGrade={selectedGrade}
          onSelectSubject={(s) => {
            setSelectedSubject(s);
            setActiveView('chat');
          }}
          onClose={() => setShowSubjectModal(false)}
        />
      )}

      {showDesignerModal && (
        <DesignerInfoModal onClose={() => setShowDesignerModal(false)} />
      )}
    </div>
  );
}
