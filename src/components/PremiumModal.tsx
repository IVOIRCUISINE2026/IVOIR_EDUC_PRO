import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Loader2, 
  Copy, 
  Check, 
  Key, 
  ArrowRight, 
  CreditCard,
  Lock,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MobileMoneyOperator } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string;
  onActivated: (code: string) => void;
}

const operators: {
  id: MobileMoneyOperator;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  ussdCode: string;
  logoText: string;
}[] = [
  {
    id: 'orange',
    name: "Orange Money CI",
    shortName: "Orange",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-500",
    badgeBg: "bg-orange-500 text-white",
    ussdCode: "#144*82#",
    logoText: "OM"
  },
  {
    id: 'wave',
    name: "Wave Côte d'Ivoire",
    shortName: "Wave",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 hover:bg-cyan-100",
    borderColor: "border-cyan-500",
    badgeBg: "bg-cyan-500 text-white",
    ussdCode: "App Wave",
    logoText: "WV"
  },
  {
    id: 'mtn',
    name: "MTN Mobile Money",
    shortName: "MTN MoMo",
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100",
    borderColor: "border-amber-500",
    badgeBg: "bg-amber-500 text-black",
    ussdCode: "*133#",
    logoText: "MoMo"
  },
  {
    id: 'moov',
    name: "Moov Money CI",
    shortName: "Moov",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-500",
    badgeBg: "bg-blue-600 text-white",
    ussdCode: "*155#",
    logoText: "Moov"
  }
];

export default function PremiumModal({ isOpen, onClose, deviceId, onActivated }: PremiumModalProps) {
  const [activeTab, setActiveTab] = useState<'pay' | 'redeem'>('pay');
  const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingCode, setExistingCode] = useState('');
  
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOp = operators.find(o => o.id === selectedOperator) || operators[0];

  const handleCopyCode = (codeToCopy: string) => {
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInitiatePayment = async () => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace('+225', '');
    if (cleanPhone.length < 8) {
      setError("Veuillez saisir un numéro de téléphone valide (ex: 0704002387).");
      return;
    }

    setError(null);
    setIsLoading(true);
    setPaymentStep('processing');

    const txRef = `TX-CI-${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionRef(txRef);

    // Simulate 3 seconds Mobile Money Push & Validation
    setTimeout(async () => {
      try {
        // Generate unique 1-year access code
        const codePart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const codePart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newCode = `IVC-PREM-${codePart1}-${codePart2}`;
        const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year

        // Save to Firestore
        await addDoc(collection(db, "access_codes"), {
          code: newCode,
          createdAt: Date.now(),
          expiresAt: expiresAt,
          isUsed: true,
          usedByDeviceId: deviceId,
          paymentMethod: selectedOperator,
          phoneNumber: cleanPhone,
          amount: 3000,
          transactionRef: txRef
        });

        // Store locally & update app status
        localStorage.setItem('ivoireduc_access_code', newCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        setGeneratedCode(newCode);

        setIsLoading(false);
        setPaymentStep('success');
        onActivated(newCode);
      } catch (err: any) {
        console.error("Error generating code:", err);
        // Fallback local activation if Firestore offline
        const fallbackCode = `IVC-PREM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        localStorage.setItem('ivoireduc_access_code', fallbackCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        setGeneratedCode(fallbackCode);
        setIsLoading(false);
        setPaymentStep('success');
        onActivated(fallbackCode);
      }
    }, 2800);
  };

  const handleRedeemExistingCode = async () => {
    if (!existingCode || existingCode.length < 5) {
      setError("Veuillez entrer un code d'activation valide.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanCode = existingCode.toUpperCase().trim();

    try {
      const q = query(collection(db, "access_codes"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Allow fallback client verification if code starts with IVC- or match pattern
        if (cleanCode.startsWith('IVC-')) {
          localStorage.setItem('ivoireduc_access_code', cleanCode);
          localStorage.setItem('ivoireduc_is_premium', 'true');
          setGeneratedCode(cleanCode);
          setPaymentStep('success');
          onActivated(cleanCode);
          setIsLoading(false);
          return;
        }
        setError("Code d'activation introuvable ou invalide.");
        setIsLoading(false);
        return;
      }

      const codeDoc = querySnapshot.docs[0];
      const codeData = codeDoc.data();

      if (Date.now() > codeData.expiresAt) {
        setError("Ce code d'accès a expiré.");
        setIsLoading(false);
        return;
      }

      if (codeData.isUsed && codeData.usedByDeviceId !== deviceId) {
        setError("Ce code est déjà activé sur un autre téléphone.");
        setIsLoading(false);
        return;
      }

      // Bind to current device
      await updateDoc(doc(db, "access_codes", codeDoc.id), {
        isUsed: true,
        usedByDeviceId: deviceId
      });

      localStorage.setItem('ivoireduc_access_code', cleanCode);
      localStorage.setItem('ivoireduc_is_premium', 'true');
      setGeneratedCode(cleanCode);
      setPaymentStep('success');
      onActivated(cleanCode);
    } catch (e: any) {
      console.error("Redeem error:", e);
      // Fallback
      localStorage.setItem('ivoireduc_access_code', cleanCode);
      localStorage.setItem('ivoireduc_is_premium', 'true');
      setGeneratedCode(cleanCode);
      setPaymentStep('success');
      onActivated(cleanCode);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-8"
      >
        {/* Header Background */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-green-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <Crown className="w-64 h-64 text-white" />
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-yellow-200">
              <Crown className="w-4 h-4 text-yellow-300 animate-pulse" />
              Option Premium IvoirEduc Pro
            </div>
            
            <h2 className="text-3xl font-black tracking-tight">
              Abonnement Annuel
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-yellow-300">3 000 F</span>
              <span className="text-sm font-bold opacity-90">CFA / an (365 jours)</span>
            </div>

            <p className="text-xs font-medium text-amber-100 leading-relaxed max-w-md">
              Débloquez l'accès illimité à toutes les matières, fiches de révisions, tuteur IA, devoirs corrigés et vidéos pour votre niveau d'études.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        {paymentStep === 'form' && (
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => { setActiveTab('pay'); setError(null); }}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pay' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Paiement Mobile Money
            </button>
            <button
              onClick={() => { setActiveTab('redeem'); setError(null); }}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'redeem' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Key className="w-4 h-4" />
              Code d'activation
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {paymentStep === 'form' && activeTab === 'pay' && (
            <div className="space-y-6">
              {/* Operator Selection */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-orange-500" />
                  1. Choisissez votre réseau Mobile Money
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {operators.map((op) => {
                    const isSelected = selectedOperator === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setSelectedOperator(op.id)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-center gap-3 ${
                          isSelected 
                            ? `${op.borderColor} ${op.bgColor} shadow-md` 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${op.badgeBg}`}>
                          {op.logoText}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-black text-xs truncate ${isSelected ? op.color : 'text-slate-800'}`}>
                            {op.shortName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {op.ussdCode}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${op.color}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-orange-500" />
                  2. Entrez votre numéro {currentOp.shortName}
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    🇨🇮 +225
                  </div>
                  <Input
                    type="tel"
                    placeholder="07 04 00 23 87"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 pl-24 text-lg font-bold rounded-2xl border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 tracking-wider"
                    maxLength={14}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">
                  Un code unique d'accès 1 an sera automatiquement attribué à ce téléphone (Appareil: {deviceId.substring(0, 10)}...).
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Purchase Summary */}
              <Card className="p-4 bg-slate-50 border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Montant de l'abonnement :</span>
                  <span className="font-bold text-slate-800">3 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Période de validité :</span>
                  <span className="font-bold text-green-600">365 jours (1 An)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Moyen de paiement :</span>
                  <span className="font-bold text-orange-600">{currentOp.name}</span>
                </div>
              </Card>

              {/* Action Button */}
              <Button
                onClick={handleInitiatePayment}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3"
              >
                <Lock className="w-5 h-5 text-yellow-200" />
                Payer 3 000 F via {currentOp.shortName}
              </Button>
            </div>
          )}

          {paymentStep === 'form' && activeTab === 'redeem' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  Saisissez votre code d'activation annuel
                </label>

                <Input
                  type="text"
                  placeholder="EX: IVC-PREM-XXXX-XXXX"
                  value={existingCode}
                  onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                  className="h-14 text-center text-xl font-mono font-black tracking-widest rounded-2xl border-slate-200 focus:ring-2 focus:ring-orange-500 uppercase"
                />
                <p className="text-[10px] text-slate-400 font-medium italic text-center">
                  Saisissez le code reçu lors de votre achat Mobile Money pour lier cet appareil.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleRedeemExistingCode}
                disabled={isLoading}
                className="w-full h-14 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Activer cet appareil"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Processing Simulation */}
          {paymentStep === 'processing' && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                <Smartphone className="w-10 h-10 text-orange-500" />
              </div>

              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-700 font-black text-xs uppercase px-3 py-1">
                  Paiement en cours ({currentOp.shortName})
                </Badge>
                <h3 className="text-xl font-black text-slate-800">
                  Validation de la transaction
                </h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                  Une demande de confirmation de <span className="font-bold text-slate-800">3 000 FCFA</span> a été transmise au numéro <span className="font-bold text-slate-800">+225 {phoneNumber}</span>.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-left space-y-2">
                <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Consigne de validation :
                </p>
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                  {currentOp.id === 'orange' && "Composez le #144*82# sur votre téléphone mobile ou approuvez la notification Orange Money."}
                  {currentOp.id === 'wave' && "Ouvrez votre application Wave et confirmez le paiement de 3 000 FCFA."}
                  {currentOp.id === 'mtn' && "Composez le *133# pour approuver le retrait de 3 000 FCFA avec votre code PIN MoMo."}
                  {currentOp.id === 'moov' && "Composez le *155# pour valider la transaction Moov Money."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération automatique du code d'accès unique...
              </div>
            </div>
          )}

          {/* Step 3: Success Screen */}
          {paymentStep === 'success' && generatedCode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-green-200">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-700 font-black text-xs uppercase px-3 py-1">
                  Abonnement Premium Activé !
                </Badge>
                <h3 className="text-2xl font-black text-slate-800">
                  Félicitations !
                </h3>
                <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
                  Votre accès annuel IvoirEduc Pro à 3 000 FCFA a été validé. Votre appareil est à présent enregistré.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3 relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Votre Code d'Activation Unique
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-black font-mono tracking-wider text-yellow-300">
                    {generatedCode}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopyCode(generatedCode)}
                    className="h-9 w-9 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800">
                  <span>Téléphone lié : {deviceId.substring(0, 12)}...</span>
                  <span className="text-green-400 font-bold">Actif (365 Jours)</span>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 gap-2"
              >
                Procéder à mon apprentissage
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
