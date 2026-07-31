import React, { useState } from 'react';
import { ArrowLeft, Calculator, Plus, Trash2, Award } from 'lucide-react';
import { MENA_COEFFICIENTS, GRADES_LIST } from '../constants/data';

interface AverageCalculatorProps {
  initialGrade: string;
  onBack: () => void;
}

interface SubjectGradeRow {
  id: string;
  subject: string;
  grade: number;
  coef: number;
}

export const AverageCalculator: React.FC<AverageCalculatorProps> = ({ initialGrade, onBack }) => {
  const [gradeClass, setGradeClass] = useState<string>(
    MENA_COEFFICIENTS[initialGrade] ? initialGrade : "3ème"
  );

  const getInitialRows = (cls: string): SubjectGradeRow[] => {
    const list = MENA_COEFFICIENTS[cls] || MENA_COEFFICIENTS["3ème"];
    return list.map((item, idx) => ({
      id: `row-${idx}`,
      subject: item.subject,
      grade: 12, // Default grade
      coef: item.coef,
    }));
  };

  const [rows, setRows] = useState<SubjectGradeRow[]>(() => getInitialRows(gradeClass));

  const handleClassChange = (newCls: string) => {
    setGradeClass(newCls);
    setRows(getInitialRows(newCls));
  };

  const updateGrade = (id: string, val: number) => {
    const clamped = Math.max(0, Math.min(20, val));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, grade: clamped } : r)));
  };

  const updateCoef = (id: string, val: number) => {
    const clamped = Math.max(1, Math.min(10, val));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, coef: clamped } : r)));
  };

  const addSubjectRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        subject: 'Nouvelle Matière',
        grade: 10,
        coef: 2,
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const totalPoints = rows.reduce((acc, r) => acc + r.grade * r.coef, 0);
  const totalCoef = rows.reduce((acc, r) => acc + r.coef, 0);
  const average = totalCoef > 0 ? totalPoints / totalCoef : 0;

  const getMention = (avg: number) => {
    if (avg >= 16) return { text: 'Très Bien', color: 'text-emerald-700 bg-emerald-100' };
    if (avg >= 14) return { text: 'Bien', color: 'text-emerald-600 bg-emerald-50' };
    if (avg >= 12) return { text: 'Assez Bien', color: 'text-blue-700 bg-blue-100' };
    if (avg >= 10) return { text: 'Passable', color: 'text-yellow-700 bg-yellow-100' };
    return { text: 'Insuffisant', color: 'text-red-700 bg-red-100' };
  };

  const mention = getMention(average);

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
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 font-heading flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-500" />
            <span>Calculateur de Moyennes MENA</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Barèmes officiels avec coefficients attribués
          </p>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-600 uppercase">Classe concernée :</span>
        <select
          value={gradeClass}
          onChange={(e) => handleClassChange(e.target.value)}
          className="bg-slate-100 font-extrabold text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {Object.keys(MENA_COEFFICIENTS).map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Results Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
            Moyenne Générale Pondérée
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black font-heading tracking-tight">
              {average.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-emerald-300">/ 20</span>
          </div>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Total Points : <span className="font-bold text-white">{totalPoints.toFixed(1)}</span> / {totalCoef * 20} (Coef: {totalCoef})
          </p>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-xl ${mention.color}`}>
            <Award className="w-4 h-4" />
            <span>{mention.text}</span>
          </span>
          <p className="text-[11px] text-emerald-200 mt-2 font-semibold">
            {average >= 10 ? 'Admis(e) sous réserve' : 'Travail renforcé recommandé'}
          </p>
        </div>
      </div>

      {/* Subject Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 grid grid-cols-12 text-xs font-black uppercase text-slate-600">
          <div className="col-span-5">Matières</div>
          <div className="col-span-3 text-center">Note /20</div>
          <div className="col-span-2 text-center">Coef</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 p-2 space-y-1">
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-12 items-center text-xs py-2 px-1">
              <div className="col-span-5 font-bold text-slate-800 truncate pr-1">
                {row.subject}
              </div>

              <div className="col-span-3 px-1">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={row.grade}
                  onChange={(e) => updateGrade(row.id, parseFloat(e.target.value) || 0)}
                  className="w-full text-center bg-slate-50 border border-slate-200 font-extrabold text-sm py-1.5 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 px-1">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={row.coef}
                  onChange={(e) => updateCoef(row.id, parseInt(e.target.value) || 1)}
                  className="w-full text-center bg-slate-50 border border-slate-200 font-bold text-xs py-1.5 rounded-lg"
                />
              </div>

              <div className="col-span-2 text-right pr-1">
                <button
                  onClick={() => removeRow(row.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={addSubjectRow}
            className="w-full py-2.5 bg-white border border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une matière optionnelle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
