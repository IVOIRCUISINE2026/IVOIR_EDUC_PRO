import React, { useState, useEffect } from 'react';
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
import { FichesRevisionView } from './components/FichesRevisionView';
import { HistoryView } from './components/HistoryView';
import { OfflineCacheView } from './components/OfflineCacheView';
import { DesignerInfoModal } from './components/DesignerInfoModal';
import { UpdatesModal } from './components/UpdatesModal';
import { StudentIdentificationScreen } from './components/StudentIdentificationScreen';
import { BottomNav, TabType } from './components/BottomNav';
import { LearningMode } from './types';
import { isPhiloGrade } from './constants/data';
import { getStoredTheme, applyTheme, Theme } from './utils/theme';
import { APP_UPDATES, getReadUpdateIds, getUnreadUpdatesCount, markAllUpdatesAsRead } from './constants/updatesData';
import { getStoredStudentProfile, saveStudentProfile, StudentProfile } from './utils/studentStorage';

export default function App() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(getStoredStudentProfile);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);
  const [showIdentificationScreen, setShowIdentificationScreen] = useState<boolean>(false);

  const [selectedGrade, setSelectedGrade] = useState<string>(studentProfile?.grade || "3ème");
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathématiques");
  const [selectedMode, setSelectedMode] = useState<LearningMode>("Interrogations et devoirs");

  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'average' | 'videos' | 'dashboard' | 'counselor' | 'fiches' | 'history' | 'offline'>('home');
  const [historyTabType, setHistoryTabType] = useState<'evaluations' | 'counselor'>('evaluations');
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Modals
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [showDesignerModal, setShowDesignerModal] = useState<boolean>(false);
  const [showUpdatesModal, setShowUpdatesModal] = useState<boolean>(false);
  const [readUpdateIds, setReadUpdateIds] = useState<string[]>(getReadUpdateIds);

  const unreadCount = APP_UPDATES.filter(u => !readUpdateIds.includes(u.id)).length;

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
    setShowIdentificationScreen(false);
    setShowWelcomeScreen(true);
  };

  const handleLogoutWithoutSave = () => {
    setActiveView('home');
    setActiveTab('accueil');
    setShowIdentificationScreen(false);
    setShowWelcomeScreen(true);
  };

  if (showWelcomeScreen) {
    return (
      <WelcomeScreen
        onEnterApp={() => {
          setShowWelcomeScreen(false);
          setShowIdentificationScreen(true);
        }}
      />
    );
  }

  if (showIdentificationScreen) {
    return (
      <StudentIdentificationScreen
        initialProfile={studentProfile}
        onBackToWelcome={() => {
          setShowIdentificationScreen(false);
          setShowWelcomeScreen(true);
        }}
        onSubmitIdentification={(profileData) => {
          const saved = saveStudentProfile(profileData);
          setStudentProfile(saved);
          if (profileData.grade) {
            handleSelectGrade(profileData.grade);
          }
          setShowIdentificationScreen(false);
          setShowWelcomeScreen(false);
        }}
      />
    );
  }

  const handleSelectMode = (mode: LearningMode) => {
    setSelectedMode(mode);

    if (mode === 'Fiches de révisions') {
      setActiveView('fiches');
    } else if (mode === 'Ressources hors-ligne') {
      setActiveView('offline');
    } else if (mode === 'Calcul de moyennes') {
      setActiveView('average');
    } else if (mode === 'Cours en vidéos') {
      setActiveView('videos');
    } else if (mode === 'Tableau de bord' || mode === 'Mes badges') {
      setActiveView('dashboard');
    } else if (mode === 'Parler à un Conseiller Pédagogique') {
      setActiveView('counselor');
    } else if (mode === 'Historique des évaluations') {
      setHistoryTabType('evaluations');
      setActiveView('history');
    } else if (mode === 'Historique Conseiller') {
      setHistoryTabType('counselor');
      setActiveView('history');
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

  const handleStartChatFromHome = () => {
    if (selectedMode === 'Fiches de révisions') {
      setActiveView('fiches');
    } else {
      setActiveView('chat');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between font-sans relative transition-colors">
      {/* Top Header */}
      {activeView !== 'chat' && activeView !== 'average' && activeView !== 'videos' && activeView !== 'fiches' && activeView !== 'history' && activeView !== 'offline' && (
        <Header
          onOpenMenu={() => setShowModeModal(true)}
          selectedGrade={selectedGrade}
          selectedSubject={selectedSubject}
          updatesCount={unreadCount}
          onOpenUpdates={() => setShowUpdatesModal(true)}
          studentName={studentProfile?.fullName}
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
            onStartChat={handleStartChatFromHome}
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

        {activeView === 'fiches' && (
          <FichesRevisionView
            selectedGrade={selectedGrade}
            selectedSubject={selectedSubject}
            onSelectGrade={handleSelectGrade}
            onSelectSubject={(s) => setSelectedSubject(s)}
            onBackToHome={() => setActiveView('home')}
            onStartChapterChat={(chapterTitle) => {
              setSelectedMode('Fiches de révisions');
              setActiveView('chat');
            }}
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
          <DashboardView
            onBack={() => setActiveView('home')}
            onOpenHistory={(type) => {
              setHistoryTabType(type);
              setActiveView('history');
            }}
            onOpenOfflineCache={() => setActiveView('offline')}
            studentProfile={studentProfile}
            onEditProfile={() => setShowIdentificationScreen(true)}
          />
        )}

        {activeView === 'counselor' && (
          <CounselorView
            onBack={() => setActiveView('home')}
            onStartCounselorChat={() => {
              setSelectedMode('Parler à un Conseiller Pédagogique');
              setActiveView('chat');
            }}
            onViewHistory={() => {
              setHistoryTabType('counselor');
              setActiveView('history');
            }}
          />
        )}

        {activeView === 'history' && (
          <HistoryView
            initialType={historyTabType}
            onBack={() => setActiveView('home')}
            onNewAssessmentClick={() => {
              setSelectedMode('Interrogations et devoirs');
              setActiveView('chat');
            }}
            onNewCounselorClick={() => {
              setSelectedMode('Parler à un Conseiller Pédagogique');
              setActiveView('counselor');
            }}
          />
        )}

        {activeView === 'offline' && (
          <OfflineCacheView
            onBack={() => setActiveView('home')}
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
            if (selectedMode === 'Fiches de révisions') {
              setActiveView('fiches');
            } else {
              setActiveView('chat');
            }
          }}
          onClose={() => setShowSubjectModal(false)}
        />
      )}

      {showDesignerModal && (
        <DesignerInfoModal onClose={() => setShowDesignerModal(false)} />
      )}

      {showUpdatesModal && (
        <UpdatesModal
          isOpen={showUpdatesModal}
          onClose={() => {
            const allRead = markAllUpdatesAsRead();
            setReadUpdateIds(allRead);
            setShowUpdatesModal(false);
          }}
          readUpdateIds={readUpdateIds}
          onUpdatesReadChange={(newReadIds) => setReadUpdateIds(newReadIds)}
        />
      )}
    </div>
  );
}

