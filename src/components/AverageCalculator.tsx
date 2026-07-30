import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { COEFFICIENTS_BY_GRADE } from '@/constants/coefficients';
import { cn } from '@/lib/utils';

interface GradeEntry {
  id: string;
  subject: string;
  coeff: number;
  average: number;
}

interface AverageCalculatorProps {
  selectedGrade: string;
}

export default function AverageCalculator({ selectedGrade }: AverageCalculatorProps) {
  const [entries, setEntries] = useState<GradeEntry[]>([]);
  
  // Initialize entries based on selected grade
  useEffect(() => {
    const coeffs = COEFFICIENTS_BY_GRADE[selectedGrade] || COEFFICIENTS_BY_GRADE["6ème"];
    const initialEntries: GradeEntry[] = coeffs.map(c => ({
      id: Math.random().toString(36).substr(2, 9),
      subject: c.subject,
      coeff: c.coefficient,
      average: 0
    }));
    setEntries(initialEntries);
  }, [selectedGrade]);

  const updateEntry = (id: string, value: string) => {
    const numValue = Math.min(20, Math.max(0, parseFloat(value) || 0));
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, average: numValue } : entry
    ));
  };

  const calculateGeneralAverage = () => {
    let totalPoints = 0;
    let totalCoeffs = 0;

    entries.forEach(entry => {
      totalPoints += entry.average * entry.coeff;
      totalCoeffs += entry.coeff;
    });

    return totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : "0.00";
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Calculateur de Moyenne</h2>
            <p className="text-sm text-slate-500">Niveau actuel : <span className="font-bold text-orange-600">{selectedGrade}</span></p>
          </div>
        </div>
        <div className="bg-orange-500 text-white px-6 py-3 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Moyenne Générale</span>
          <span className="text-3xl font-black">{calculateGeneralAverage()}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden border-slate-100 hover:border-orange-200 transition-all shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="p-4 md:w-1/3 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center justify-between md:flex-col md:items-start gap-2">
                    <h3 className="font-bold text-slate-800">{entry.subject}</h3>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Coeff: {entry.coeff}</Badge>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex items-center gap-6">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Moyenne de la matière</label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="20" 
                      step="0.25"
                      placeholder="Entrez la moyenne..."
                      value={entry.average || ""} 
                      onChange={(e) => updateEntry(entry.id, e.target.value)}
                      className={cn(
                        "h-12 text-lg font-bold focus:ring-orange-500 transition-colors",
                        entry.average >= 10 ? "text-green-600 border-green-200" : entry.average > 0 ? "text-red-500 border-red-200" : ""
                      )}
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-[100px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Points</span>
                    <span className="text-xl font-black text-slate-700">
                      {(entry.average * entry.coeff).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pb-12">
        <Button variant="outline" className="gap-2 text-slate-500 hover:text-orange-500" onClick={() => {
          if (confirm("Voulez-vous vraiment réinitialiser toutes les notes ?")) {
            setEntries(prev => prev.map(e => ({ ...e, average: 0 })));
          }
        }}>
          <RefreshCw className="w-4 h-4" /> Réinitialiser les moyennes
        </Button>
      </div>
    </div>
  );
}
