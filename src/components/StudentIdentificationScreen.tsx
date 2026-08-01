import React, { useState } from 'react';
import { User, GraduationCap, Building2, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { GRADES_LIST } from '../constants/data';
import { StudentProfile } from '../utils/studentStorage';

interface StudentIdentificationScreenProps {
  initialProfile?: StudentProfile | null;
  onBackToWelcome: () => void;
  onSubmitIdentification: (profile: { fullName: string; grade: string; school: string }) => void;
}

export const StudentIdentificationScreen: React.FC<StudentIdentificationScreenProps> = ({
  initialProfile,
  onBackToWelcome,
  onSubmitIdentification,
}) => {
  const [fullName, setFullName] = useState<string>(initialProfile?.fullName || '');
  const [grade, setGrade] = useState<string>(initialProfile?.grade || '3ème');
  const [school, setSchool] = useState<string>(initialProfile?.school || '');

  const [errors, setErrors] = useState<{ fullName?: string; grade?: string; school?: string }>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

  const validateForm = () => {
    const newErrors: { fullName?: string; grade?: string; school?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Le nom et prénoms sont obligatoires.";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Veuillez saisir votre nom complet (au moins 3 caractères).";
    }

    if (!grade.trim()) {
      newErrors.grade = "Le niveau d'étude est obligatoire.";
    }

    if (!school.trim()) {
      newErrors.school = "L'établissement scolaire est obligatoire.";
    } else if (school.trim().length < 2) {
      newErrors.school = "Veuillez préciser le nom de votre établissement (ex: Lycée Classique Abidjan).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (validateForm()) {
      onSubmitIdentification({
        fullName: fullName.trim(),
        grade: grade.trim(),
        school: school.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-emerald-50/30 flex flex-col justify-between items-center p-4 relative overflow-y-auto font-sans">
      {/* Decorative side borders matching Ivoirian flag colors */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 sm:w-3.5 bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-2.5 sm:w-3.5 bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700 z-10" />

      {/* Top Bar with Back Button */}
      <div className="w-full max-w-md mx-auto pt-2 flex items-center justify-between z-20">
        <button
          onClick={onBackToWelcome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer shadow-2xs font-heading"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>Retour à l'accueil</span>
        </button>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 text-[10px] font-black uppercase tracking-wider font-heading">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
          <span>Espace Élève Sécurisé</span>
        </div>
      </div>

      {/* Main Identification Form Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6 px-4 z-20 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 border-2 border-white ring-4 ring-orange-400/20">
            <User className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900">
            Fiche d'Identification
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xs mx-auto">
            Remplissez obligatoirement vos informations pour accéder à la plateforme d'apprentissage <span className="font-bold text-orange-600">IvoirEduc Pro</span>.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 space-y-5">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-heading">
              Saisie obligatoire (3/3 champs)
            </span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
              Champs requis *
            </span>
          </div>

          {/* Error Banner if submit attempted and invalid */}
          {attemptedSubmit && Object.keys(errors).length > 0 && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-black font-heading block">Informations incomplètes</span>
                <span>Veuillez renseigner tous les champs obligatoires ci-dessous pour continuer.</span>
              </div>
            </div>
          )}

          {/* Field 1: Nom et Prénoms */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-heading">
              <User className="w-4 h-4 text-orange-500" />
              <span>Nom et Prénoms <span className="text-red-500 font-bold">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Ex: YAO Koffi Jean-Baptiste"
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all outline-none text-slate-900 bg-slate-50/50 focus:bg-white ${
                  errors.fullName
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                }`}
              />
              {fullName.trim().length >= 3 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Field 2: Niveau d'Étude */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-heading">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Niveau d'Étude Scolaire <span className="text-red-500 font-bold">*</span></span>
            </label>
            <div className="relative">
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  if (errors.grade) setErrors(prev => ({ ...prev, grade: undefined }));
                }}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none text-slate-900 bg-slate-50/50 focus:bg-white appearance-none cursor-pointer ${
                  errors.grade
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
              >
                {GRADES_LIST.map((g) => (
                  <option key={g} value={g} className="font-bold py-1">
                    {g} {g.includes('3ème') ? '(Examen BEPC)' : g.includes('Terminale') ? '(Examen BAC)' : g.includes('CM2') ? '(Examen CEPE)' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-slate-400 text-xs font-bold">
                ▼
              </div>
            </div>
            {errors.grade && (
              <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.grade}</span>
              </p>
            )}
          </div>

          {/* Field 3: Établissement Scolaire */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-heading">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Établissement Scolaire <span className="text-red-500 font-bold">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  if (errors.school) setErrors(prev => ({ ...prev, school: undefined }));
                }}
                placeholder="Ex: Lycée Classique d'Abidjan / Collège Moderne Bouaké"
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all outline-none text-slate-900 bg-slate-50/50 focus:bg-white ${
                  errors.school
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                }`}
              />
              {school.trim().length >= 2 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
            {errors.school && (
              <p className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.school}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 via-orange-500 to-emerald-600 hover:from-orange-600 hover:to-emerald-700 text-white font-black text-base py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-heading active:scale-[0.98]"
            >
              <span>Accéder à l'application</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

        </form>

        {/* Security / Privacy Footnote */}
        <div className="text-center space-y-1 text-slate-400 text-[11px] font-medium">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Plateforme Officielle d'Excellence Scolaire — Côte d'Ivoire</span>
          </p>
        </div>

      </div>

      {/* Flag accent footer */}
      <div className="flex items-center justify-center gap-2.5 pb-4 z-20">
        <div className="w-12 h-1.5 rounded-full bg-orange-500" />
        <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        <div className="w-12 h-1.5 rounded-full bg-emerald-500" />
      </div>

    </div>
  );
};
