/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import CodeVerification from './components/CodeVerification';
import PremiumModal from './components/PremiumModal';
import { LearningMode, UserRole } from './types';
import { db } from './lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState<string>("3ème");
  const [selectedSubject, setSelectedSubject] = useState<string>("Mathématiques");
  const [selectedMode, setSelectedMode] = useState<LearningMode>("Interrogations et devoirs");

  // Robust Role Detection & Persistence
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlRole = queryParams.get('role');
    const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : "");
    const hashRole = hashParams.get('role');
    const detectedRole = (urlRole || hashRole) as UserRole | null;
    
    if (detectedRole === 'apprenant' || detectedRole === 'administrateur') {
      localStorage.setItem('ivoireduc_role', detectedRole);
      return detectedRole;
    }
    
    const savedRole = localStorage.getItem('ivoireduc_role') as UserRole | null;
    if (savedRole === 'apprenant' || savedRole === 'administrateur') {
      return savedRole;
    }
    
    // Default main application role is administrator
    return 'administrateur';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // Access Verification & Premium States
  const [isCodeVerified, setIsCodeVerified] = useState<boolean>(true);
  const [isCheckingCode, setIsCheckingCode] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('ivoireduc_is_premium') === 'true';
  });

  // Auto-open premium modal if direct link with ?subscribe=premium or ?premium=true is used
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : "");
    const sub = queryParams.get('subscribe') || hashParams.get('subscribe');
    const prem = queryParams.get('premium') || hashParams.get('premium');
    if (sub === 'premium' || prem === 'true' || sub === '3000') {
      setShowPremiumModal(true);
    }
  }, []);

  // Device ID generation/retrieval
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('ivoireduc_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('ivoireduc_device_id', id);
    }
    return id;
  });

  // Access verification (all constraints deactivated)
  useEffect(() => {
    setIsCodeVerified(true);
    setIsCheckingCode(false);
  }, []);

  const resetApp = () => {
    setSelectedGrade("3ème");
    setSelectedSubject("Mathématiques");
    setSelectedMode("Interrogations et devoirs");
  };

  if (isCheckingCode) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Vérification de l'accès usager...</p>
        </div>
      </div>
    );
  }

  if (!isCodeVerified || !isLoggedIn) {
    return (
      <>
        <CodeVerification 
          deviceId={deviceId} 
          onVerified={() => {
            setIsCodeVerified(true);
            setIsLoggedIn(true);
          }} 
          onOpenPremium={() => setShowPremiumModal(true)}
        />
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          deviceId={deviceId}
          onActivated={(code) => {
            setIsPremium(true);
            setIsCodeVerified(true);
            setIsLoggedIn(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        onLogout={() => setIsLoggedIn(false)}
        onReset={resetApp}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userRole={userRole}
        onOpenPremium={() => setShowPremiumModal(true)}
        isPremium={isPremium}
      />
      
      <main className="flex-1 flex flex-col lg:ml-72 h-full">
        <MainContent 
          selectedGrade={selectedGrade}
          selectedSubject={selectedSubject}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          onLogout={() => setIsLoggedIn(false)}
          onReset={resetApp}
          setIsSidebarOpen={setIsSidebarOpen}
          userRole={userRole}
          onOpenPremium={() => setShowPremiumModal(true)}
          isPremium={isPremium}
        />
      </main>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        deviceId={deviceId}
        onActivated={(code) => {
          setIsPremium(true);
          setIsCodeVerified(true);
        }}
      />
    </div>
  );
}
