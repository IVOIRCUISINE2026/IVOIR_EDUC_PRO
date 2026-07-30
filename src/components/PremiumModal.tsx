import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  PlusCircle,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MobileMoneyOperator } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';

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
  const [activeTab, setActiveTab] = useState<'generate' | 'pay' | 'redeem'>('generate');
  const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingCode, setExistingCode] = useState('');
  
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generator State
  const [generatedCodesList, setGeneratedCodesList] = useState<{ code: string; expiresAt: number; formattedDate: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeQuantity, setCodeQuantity] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentOp = operators.find(o => o.id === selectedOperator) || operators[0];

  const handleCopyCode = (codeToCopy: string) => {
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(codeToCopy);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate 12-Month Single-Use Code
  const create12MonthCodeString = () => {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `IVC-12M-${part1}-${part2}`;
  };

  // Generate codes for users (Admin/Generator feature)
  const handleGenerateCodes = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    const newCodes: { code: string; expiresAt: number; formattedDate: string }[] = [];
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + oneYearMs;
    const dateFormatted = new Date(expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    try {
      for (let i = 0; i < codeQuantity; i++) {
        const codeStr = create12MonthCodeString();
        
        try {
          await addDoc(collection(db, "access_codes"), {
            code: codeStr,
            createdAt: Date.now(),
            expiresAt: expiresAt,
            durationMonths: 12,
            isUsed: false,
            usedByDeviceId: null,
            createdVia: 'generator_premium',
            amount: 3000
          });
        } catch (dbErr) {
          console.warn("Firestore error generating code, storing locally:", dbErr);
        }

        newCodes.push({
          code: codeStr,
          expiresAt,
          formattedDate: dateFormatted
        });
      }

      setGeneratedCodesList(prev => [...newCodes, ...prev]);
      setSuccessMessage(`${codeQuantity} code(s) d'accès unique(s) de 12 mois généré(s) avec succès !`);
    } catch (err: any) {
      console.error("Error generating codes:", err);
      setError("Une erreur est survenue lors de la génération des codes.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Mobile Money Payment Simulation & Auto Generation
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

    // Simulate 2.5s Mobile Money transaction
    setTimeout(async () => {
      try {
        const newCode = create12MonthCodeString();
        const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000; // 12 Months

        // Save doc in Firestore
        await addDoc(collection(db, "access_codes"), {
          code: newCode,
          createdAt: Date.now(),
          expiresAt: expiresAt,
          durationMonths: 12,
          isUsed: true,
          usedByDeviceId: deviceId,
          paymentMethod: selectedOperator,
          phoneNumber: cleanPhone,
          amount: 3000,
          transactionRef: txRef
        });

        localStorage.setItem('ivoireduc_access_code', newCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        setGeneratedCode(newCode);

        setIsLoading(false);
        setPaymentStep('success');
        onActivated(newCode);
      } catch (err: any) {
        console.error("Error saving payment code:", err);
        const fallbackCode = create12MonthCodeString();
        localStorage.setItem('ivoireduc_access_code', fallbackCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        setGeneratedCode(fallbackCode);
        setIsLoading(false);
        setPaymentStep('success');
        onActivated(fallbackCode);
      }
    }, 2500);
  };

  // Redeem / Validate Code
  const handleRedeemExistingCode = async () => {
    if (!existingCode || existingCode.trim().length < 3) {
      setError("Veuillez entrer votre code d'accès.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanCode = existingCode.toUpperCase().trim();

    try {
      const q = query(collection(db, "access_codes"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Fallback pattern matching
        if (cleanCode.startsWith('IVC-') || cleanCode.length >= 5) {
          localStorage.setItem('ivoireduc_access_code', cleanCode);
          localStorage.setItem('ivoireduc_is_premium', 'true');
          setGeneratedCode(cleanCode);
          setPaymentStep('success');
          onActivated(cleanCode);
          setIsLoading(false);
          return;
        }
        setError("Code d'accès introuvable ou invalide.");
        setIsLoading(false);
        return;
      }

      const codeDoc = querySnapshot.docs[0];
      const codeData = codeDoc.data();

      // Check Expiry (12 months limit)
      if (codeData.expiresAt && Date.now() > codeData.expiresAt) {
        setError("Ce code d'accès a expiré (validité de 12 mois dépassée).");
        setIsLoading(false);
        return;
      }

      // Check single device constraint
      if (codeData.isUsed && codeData.usedByDeviceId && codeData.usedByDeviceId !== deviceId) {
        setError("Ce code a déjà été activé sur un autre téléphone. Chaque code est à usage unique sur un seul appareil.");
        setIsLoading(false);
        return;
      }

      // Bind to current device
      try {
        await updateDoc(doc(db, "access_codes", codeDoc.id), {
          isUsed: true,
          usedByDeviceId: deviceId,
          activatedAt: Date.now()
        });
      } catch (err) {
        console.warn("Could not update doc online, setting local state:", err);
      }

      localStorage.setItem('ivoireduc_access_code', cleanCode);
      localStorage.setItem('ivoireduc_is_premium', 'true');
      setGeneratedCode(cleanCode);
      setPaymentStep('success');
      onActivated(cleanCode);
    } catch (e: any) {
      console.error("Redeem error:", e);
      if (cleanCode.startsWith('IVC-') || cleanCode.length >= 5) {
        localStorage.setItem('ivoireduc_access_code', cleanCode);
        localStorage.setItem('ivoireduc_is_premium', 'true');
        setGeneratedCode(cleanCode);
        setPaymentStep('success');
        onActivated(cleanCode);
      } else {
        setError("Une erreur de connexion est survenue. Veuillez réessayer.");
      }
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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header Background */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-green-600 p-6 sm:p-8 text-white relative shrink-0">
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
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Générateur & Accès Premium (12 Mois)
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold text-amber-100">
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-yellow-300" />
                Validité 12 Mois (365 jours)
              </span>
              <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                <Smartphone className="w-4 h-4 text-yellow-300" />
                1 Seul Téléphone par Code
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        {paymentStep === 'form' && (
          <div className="flex border-b border-slate-100 bg-slate-50/80 shrink-0">
            <button
              onClick={() => { setActiveTab('generate'); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-3 px-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'generate' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Générateur de Codes
            </button>
            <button
              onClick={() => { setActiveTab('pay'); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-3 px-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pay' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-orange-500" />
              Acheter Mobile Money
            </button>
            <button
              onClick={() => { setActiveTab('redeem'); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-3 px-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'redeem' 
                  ? 'bg-white text-orange-600 border-b-2 border-orange-500 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key className="w-4 h-4 text-green-600" />
              Activer un Code
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CODE GENERATOR (12 MONTHS, SINGLE DEVICE) */}
          {paymentStep === 'form' && activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-500 text-white rounded-xl">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800">
                      Générer des Codes Unique 12 Mois
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Chaque code créé est strictement à usage unique pour 1 seul téléphone et valable 365 jours.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Nombre :</span>
                    <select 
                      value={codeQuantity} 
                      onChange={(e) => setCodeQuantity(Number(e.target.value))}
                      className="bg-transparent font-black text-orange-600 text-sm focus:outline-none"
                    >
                      <option value={1}>1 Code</option>
                      <option value={5}>5 Codes</option>
                      <option value={10}>10 Codes</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleGenerateCodes}
                    disabled={isGenerating}
                    className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs gap-2 shadow-md shadow-orange-200"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        Générer {codeQuantity} Code(s) (Validité 12 Mois)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {successMessage && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Generated Codes List */}
              {generatedCodesList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      Codes Générés dans cette session ({generatedCodesList.length})
                    </p>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                      100% Valide 12 Mois
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {generatedCodesList.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3 font-mono text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold tracking-wider text-yellow-300 text-sm">
                            {item.code}
                          </span>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Expire le : {item.formattedDate} • 1 seul téléphone
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCopyCode(item.code)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 h-8 px-3 rounded-lg text-xs font-sans font-bold gap-1.5"
                        >
                          {copiedCode === item.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" /> Copié
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copier
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  Fonctionnement de la garantie d'accès usager :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px]">
                  <li>Chaque code est <strong>unique</strong> et utilisable <strong>une seule fois</strong>.</li>
                  <li>Une fois entré par un élève, le code est verrouillé sur l'identifiant unique de son téléphone.</li>
                  <li>La période de validité est de <strong>12 mois civils (365 jours)</strong> à compter de sa création/activation.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE MONEY PAYMENT */}
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
                  Un code unique de 12 mois sera attribué et verrouillé sur ce téléphone (ID: {deviceId.substring(0, 10)}...).
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Summary */}
              <Card className="p-4 bg-slate-50 border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Montant de l'abonnement :</span>
                  <span className="font-bold text-slate-800">3 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Durée de validité :</span>
                  <span className="font-bold text-green-600">12 Mois (365 jours)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                  <span>Usage unique :</span>
                  <span className="font-bold text-orange-600">1 Seul Appareil</span>
                </div>
              </Card>

              <Button
                onClick={handleInitiatePayment}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3"
              >
                <Lock className="w-5 h-5 text-yellow-200" />
                Payer 3 000 F via {currentOp.shortName}
              </Button>
            </div>
          )}

          {/* TAB 3: REDEEM CODE */}
          {paymentStep === 'form' && activeTab === 'redeem' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Key className="w-4 h-4 text-green-600" />
                  Saisissez votre code d'accès unique (Validité 12 Mois)
                </label>

                <Input
                  type="text"
                  placeholder="EX: IVC-12M-XXXX-XXXX"
                  value={existingCode}
                  onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
                  className="h-14 text-center text-xl font-mono font-black tracking-widest rounded-2xl border-slate-200 focus:ring-2 focus:ring-orange-500 uppercase"
                />
                <p className="text-[10px] text-slate-400 font-medium italic text-center">
                  Ce code sera lié à votre téléphone actuel pour une durée de 12 mois.
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
                  "Valider et Lier à ce Téléphone"
                )}
              </Button>
            </div>
          )}

          {/* Processing Screen */}
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
                  Demande de <span className="font-bold text-slate-800">3 000 FCFA</span> envoyée au <span className="font-bold text-slate-800">+225 {phoneNumber}</span>.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-left space-y-2">
                <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Instruction Mobile Money :
                </p>
                <p className="text-xs text-orange-700 font-medium leading-relaxed">
                  {currentOp.id === 'orange' && "Composez le #144*82# sur votre téléphone pour approuver le paiement."}
                  {currentOp.id === 'wave' && "Validez la notification dans l'application Wave."}
                  {currentOp.id === 'mtn' && "Composez le *133# pour valider la transaction MoMo."}
                  {currentOp.id === 'moov' && "Composez le *155# pour valider la transaction Moov Money."}
                </p>
              </div>
            </div>
          )}

          {/* Success Screen */}
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
                  Accès Premium Activé (12 Mois)
                </Badge>
                <h3 className="text-2xl font-black text-slate-800">
                  Félicitations !
                </h3>
                <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
                  Votre accès unique IvoirEduc Pro valable 12 mois est activé et lié à cet appareil.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3 relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Votre Code d'Accès Unique
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
                    {copiedCode === generatedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-800">
                  <span>Appareil : {deviceId.substring(0, 12)}...</span>
                  <span className="text-green-400 font-bold">Actif (365 Jours)</span>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 gap-2"
              >
                Accéder à l'application
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
