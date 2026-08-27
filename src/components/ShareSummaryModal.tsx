import React, { useState } from 'react';
import { X, Copy, Check, Share2, FileText, Calendar, Building2, UtensilsCrossed } from 'lucide-react';
import { PersonDebt } from '../types';
import { generateWhatsAppFullSummary } from '../utils/formatters';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PersonDebt[];
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'all_deadlines' | 'reserve_focus'>('all_deadlines');
  const [copied, setCopied] = useState(false);

  const summaryText = generateWhatsAppFullSummary(data, activeMode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="share-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div id="share-modal-card" className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/60">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Resumo Formatado para Envio</h3>
              <p className="text-xs text-slate-400">Pronto para copiar e colar no WhatsApp ou grupo com os prazos definidos</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-950/30 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('all_deadlines')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'all_deadlines'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Completo (10/09 e 07/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('reserve_focus')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'reserve_focus'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Foco 1ª Parcela: Reserva (10/09)
          </button>
        </div>

        {/* Body Textarea */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="relative">
            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono border border-slate-800 whitespace-pre-wrap leading-relaxed select-all">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            id="btn-print-summary"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4" /> Imprimir Relatório
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-close-share"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Fechar
            </button>
            <button
              type="button"
              id="btn-copy-summary"
              onClick={handleCopy}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-lg ${
                copied
                  ? 'bg-emerald-500 text-white shadow-emerald-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Mensagem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
