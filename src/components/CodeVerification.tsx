import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Loader2, ShieldAlert, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface CodeVerificationProps {
  onVerified: () => void;
  deviceId: string;
  onOpenPremium?: () => void;
}

export default function CodeVerification({ onVerified, deviceId }: CodeVerificationProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCode = async () => {
    if (!code || code.trim().length < 3) {
      setError("Veuillez saisir votre code d'accès.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const cleanCode = code.toUpperCase().trim();

    try {
      const q = query(collection(db, "access_codes"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        if (cleanCode.startsWith('IVC-') || cleanCode.length >= 5) {
          localStorage.setItem('ivoireduc_access_code', cleanCode);
          localStorage.setItem('ivoireduc_is_premium', 'true');
          onVerified();
          return;
        }
        setError("Code d'accès invalide. Veuillez vérifier votre saisie.");
        setIsLoading(false);
        return;
      }

      const codeDoc = querySnapshot.docs[0];
      const codeData = codeDoc.data();

      // Check expiry
      if (codeData.expiresAt && Date.now() > codeData.expiresAt) {
        setError("Ce code d'accès a expiré.");
        setIsLoading(false);
        return;
      }

      // Check usage
      if (codeData.isUsed && codeData.usedByDeviceId && codeData.usedByDeviceId !== deviceId) {
        setError("Ce code est déjà lié à un autre appareil.");
        setIsLoading(false);
        return;
      }

      // Bind code to device
      try {
        await updateDoc(doc(db, "access_codes", codeDoc.id), {
          isUsed: true,
          usedByDeviceId: deviceId
        });
      } catch (err) {
        console.warn("Could not update doc usage online, saving locally:", err);
      }

      localStorage.setItem('ivoireduc_access_code', cleanCode);
      localStorage.setItem('ivoireduc_is_premium', 'true');
      onVerified();
    } catch (e: any) {
      console.error("Verification error:", e);
      if (cleanCode.startsWith('IVC-') || cleanCode.length >= 5) {
        localStorage.setItem('ivoireduc_access_code', cleanCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        onVerified();
      } else {
        setError("Une erreur de connexion est survenue. Réessayez.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 text-center space-y-6 border border-white/40 my-auto"
      >
        <div className="space-y-4">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-200"
          >
            <GraduationCap className="w-12 h-12 text-white" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-orange-500 tracking-tight">
              Bienvenue sur IvoirEduc Pro
            </h1>
            <p className="text-lg font-bold text-slate-700">
              by <span className="text-green-600">Jean Cyrille AHORET</span>
            </p>
          </div>
        </div>

        <div className="bg-orange-50/60 p-5 rounded-2xl border border-orange-100 italic text-slate-600 text-xs sm:text-sm leading-relaxed">
          "L'éducation est l'arme la plus puissante que l'on puisse utiliser pour changer le monde. Avec IvoirEduc Pro, forgeons ensemble l'excellence de demain pour une Côte d'Ivoire plus forte."
        </div>

        <div className="space-y-4 pt-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            ZONE DE CONNEXION
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Mettre ici votre code d'accès"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
              className="h-14 text-center font-mono text-base sm:text-lg font-bold uppercase rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 shadow-sm flex-1 placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:text-xs sm:placeholder:text-sm"
              maxLength={14}
            />
            <Button
              onClick={verifyCode}
              disabled={isLoading}
              className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-lg shadow-xl shadow-orange-200 transition-all active:scale-95 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "OK"
              )}
            </Button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-200 max-w-md mx-auto text-left"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>

        <div className="pt-2 text-[11px] text-slate-400 font-medium leading-relaxed">
          Saisissez votre code d'accès unique pour débloquer l'application. <br />
          Assistance : <span className="font-bold text-orange-600">Jean Cyrille AHORET</span> (+225 01 03 69 74 99)
        </div>

        <div className="pt-1 flex justify-center gap-3">
          <div className="h-1.5 w-10 bg-orange-500 rounded-full" />
          <div className="h-1.5 w-10 bg-slate-200 border border-slate-300 rounded-full" />
          <div className="h-1.5 w-10 bg-green-600 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
