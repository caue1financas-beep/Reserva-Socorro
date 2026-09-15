import React, { useState } from 'react';
import { X, Copy, Check, Share2, FileText, Calendar, Building2, QrCode, Key } from 'lucide-react';
import { PersonDebt } from '../types';
import { generateWhatsAppFullSummary, generateDirectStatementList, PIX_CONFIG } from '../utils/formatters';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PersonDebt[];
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'all_deadlines' | 'compact' | 'reserve_focus'>('compact');
  const [copied, setCopied] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const summaryText =
    activeMode === 'compact'
      ? generateDirectStatementList(data)
      : generateWhatsAppFullSummary(data, activeMode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyPixOnly = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CONFIG.key);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (err) {
      console.error('Failed to copy pix', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="share-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div id="share-modal-card" className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Resumo Formatado para Envio</h3>
              <p className="text-xs text-slate-500">Pronto para copiar e colar no WhatsApp com dados de Pix inclusos</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('compact')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'compact'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Lista Direta / Prestação de Contas
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('all_deadlines')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'all_deadlines'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Detalhado (10/09 e 07/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('reserve_focus')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'reserve_focus'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Foco Reserva (10/09)
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {/* Quick Pix Bar */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Pix: {PIX_CONFIG.bank}</span>
                  <span className="text-slate-400">•</span>
                  <span>{PIX_CONFIG.holder}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 font-semibold select-all">
                  {PIX_CONFIG.key}
                </div>
              </div>
            </div>

            <button
              type="button"
              id="btn-copy-pix-modal-fast"
              onClick={handleCopyPixOnly}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border shrink-0 ${
                copiedPix
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Key className="w-3.5 h-3.5 text-amber-600" />}
              <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Apenas a Chave Pix'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-50 text-slate-800 p-4 rounded-xl text-xs font-mono border border-slate-200 whitespace-pre-wrap leading-relaxed select-all shadow-inner max-h-80 overflow-y-auto">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            id="btn-print-summary"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 flex items-center gap-1.5 transition shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-500" /> Imprimir Relatório
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="btn-modal-copy-pix-secondary"
              onClick={handleCopyPixOnly}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border shadow-2xs ${
                copiedPix
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {copiedPix ? <Check className="w-4 h-4 text-emerald-600" /> : <Key className="w-4 h-4 text-amber-600" />}
              <span>{copiedPix ? 'Chave Pix Copiada!' : 'Copiar Apenas a Chave Pix'}</span>
            </button>

            <button
              type="button"
              id="btn-copy-summary"
              onClick={handleCopy}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copiado com Sucesso!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Mensagem Completa
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
