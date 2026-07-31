import React from 'react';
import { ArrowLeft, ShieldCheck, Phone, MessageCircle, ExternalLink, Sparkles, Award } from 'lucide-react';

interface DesignerInfoModalProps {
  onClose: () => void;
}

export const DesignerInfoModal: React.FC<DesignerInfoModalProps> = ({ onClose }) => {
  const phoneNumber = "2250704002387";
  const whatsappUrl = `https://wa.me/2250704002387?text=${encodeURIComponent("Bonjour M. Jean Cyrille Ahoret, je vous contacte depuis l'application Ivoir'Educ PRO.")}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors absolute top-4 left-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center pt-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-lg mb-3">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <span className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-heading">
              Auteur & Développeur
            </span>
            <h2 className="text-xl font-black text-white font-heading mt-1">
              Jean Cyrille Ahoret
            </h2>
            <p className="text-xs text-orange-100 font-medium">
              Concepteur de la plateforme Ivoir'Educ PRO
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 font-heading uppercase">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Vision d'Ivoir'Educ PRO</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ivoir'Educ PRO a été conçu pour offrir à chaque élève de Côte d'Ivoire un tuteur IA interactif, accessible, conforme aux programmes du MENA, facilitant les révisions du CEPE, du BEPC et du BAC.
            </p>
          </div>

          {/* Contact Actions */}
          <div className="space-y-2.5">
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Contacts officiels :
            </p>

            <a
              href={`tel:${phoneNumber}`}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white p-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-between shadow-md transition-all font-heading"
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>Appeler : +{phoneNumber}</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white p-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-between shadow-md transition-all font-heading"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-300" />
                <span>Discuter sur WhatsApp</span>
              </div>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-extrabold text-slate-600 hover:text-slate-900 uppercase font-heading"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
