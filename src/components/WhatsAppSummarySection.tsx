import React, { useState } from 'react';
import { Copy, Check, MessageSquareText, Calendar, Building2, FileText, QrCode, Key } from 'lucide-react';
import { PersonDebt } from '../types';
import {
  generateWhatsAppFullSummary,
  getPixFormattedBlock,
  PIX_CONFIG,
  ADVANCE_RESERVE_EXPENSE,
  SETTLEMENT_RESERVE_EXPENSE,
  TOTAL_RESERVE_EXPENSES,
  formatCurrency,
  getPersonDeadlineBreakdown,
} from '../utils/formatters';

interface WhatsAppSummarySectionProps {
  data: PersonDebt[];
}

export const WhatsAppSummarySection: React.FC<WhatsAppSummarySectionProps> = ({ data }) => {
  const [copiedMode, setCopiedMode] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reserve_only' | 'compact'>('compact');

  const pendingList = data.filter((p) => p.pendingAmount > 0);
  const totalPendente = data.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const totalArrecadado = data.reduce((acc, curr) => acc + curr.paidAmount, 0);

  // Formatação da Lista Direta / Prestação de Contas
  const generateCompactList = () => {
    const totalGastos = TOTAL_RESERVE_EXPENSES; // R$ 2.500,00
    const saldoEmConta = totalArrecadado - totalGastos; // R$ 215,00

    let msg = `🔴 *PRESTAÇÃO DE CONTAS & VALORES PENDENTES*\n\n`;
    msg += `🏨 *1. RESERVA DA CHÁCARA (100% QUITADA COM O IMÓVEL!)*\n`;
    msg += `• Adiantamento pago reserva: -${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
    msg += `• Quitação da reserva: -${formatCurrency(SETTLEMENT_RESERVE_EXPENSE)}\n`;
    msg += `• Total de gastos da reserva: -${formatCurrency(totalGastos)} (Pago ao proprietário!)\n\n`;

    msg += `💵 *2. FLUXO DE CAIXA ATUAL:*\n`;
    msg += `• Total Arrecadado (Pix recebido): ${formatCurrency(totalArrecadado)}\n`;
    msg += `• (-) Gastos da Reserva: -${formatCurrency(totalGastos)}\n`;
    msg += `• 👉 *SALDO ATUAL EM CONTA:* *${formatCurrency(saldoEmConta)}* (já reservado para alimentação)\n`;
    msg += `• Total geral a receber: ${formatCurrency(totalPendente)}\n\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👥 *3. DETALHAMENTO DE CADA PARTICIPANTE:*\n`;
    msg += `_(Quanto cada um pagou e quanto ainda falta)_\n\n`;

    const sorted = [...data].sort((a, b) => b.pendingAmount - a.pendingAmount);

    sorted.forEach((p, idx) => {
      const b = getPersonDeadlineBreakdown(p);
      if (p.pendingAmount === 0) {
        msg += `${idx + 1}. 🟢 *${p.name}*: ✅ *QUITADO!* (Pagou: ${formatCurrency(p.paidAmount)})\n`;
      } else {
        let detalhePendente = '';
        if (b.pendingReserve > 0) {
          detalhePendente = `[Falta Reserva: ${formatCurrency(b.pendingReserve)} | Falta Alim: ${formatCurrency(b.pendingFood)}]`;
        } else {
          detalhePendente = `[Reserva OK ✅ | Falta Alim 07/10: ${formatCurrency(b.pendingFood)}]`;
        }
        msg += `${idx + 1}. 🔴 *${p.name}*:\n   • Já Pagou: *${formatCurrency(p.paidAmount)}*\n   • Falta Pagar: *${formatCurrency(p.pendingAmount)}* ${detalhePendente}\n`;
      }
    });

    msg += `\n` + getPixFormattedBlock();
    return msg;
  };

  const getMessageText = () => {
    if (activeTab === 'compact') return generateCompactList();
    if (activeTab === 'reserve_only') return generateWhatsAppFullSummary(data, 'reserve_focus');
    return generateWhatsAppFullSummary(data, 'all_deadlines');
  };

  const textToDisplay = getMessageText();

  const handleCopy = async (mode: string) => {
    try {
      await navigator.clipboard.writeText(textToDisplay);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPixOnly = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CONFIG.key);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="whatsapp-summary-box" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden space-y-4">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Resumo Formatado para WhatsApp
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                Pix Incluso
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {pendingList.length} pessoas com pendências (Total de R$ {totalPendente.toLocaleString('pt-BR')},00)
            </p>
          </div>
        </div>

        {/* Buttons: Copiar Mensagem + Copiar Apenas Chave Pix */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Copy Pix Only Button */}
          <button
            type="button"
            id="btn-copy-pix-only-inline"
            onClick={handleCopyPixOnly}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition border shadow-2xs ${
              copiedPix
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'
            }`}
          >
            {copiedPix ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Chave Pix Copiada!</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4 text-amber-600" />
                <span>Copiar Apenas a Chave Pix</span>
              </>
            )}
          </button>

          {/* Copy Full Message Button */}
          <button
            type="button"
            id="btn-copy-whatsapp-inline"
            onClick={() => handleCopy(activeTab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm ${
              copiedMode
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {copiedMode ? (
              <>
                <Check className="w-4 h-4" /> Copiado com Pix Incluso!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Mensagem Pronta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Pix Card for Quick Reference */}
      <div id="pix-reference-banner" className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-slate-900 font-bold">
              <span>{PIX_CONFIG.bank}</span>
              <span className="text-slate-400">•</span>
              <span>Titular: {PIX_CONFIG.holder}</span>
              <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                Chave {PIX_CONFIG.type}
              </span>
            </div>
            <div className="font-mono text-xs text-slate-800 font-bold select-all mt-0.5 tracking-tight">
              {PIX_CONFIG.key}
            </div>
          </div>
        </div>

        <button
          type="button"
          id="btn-quick-pix-banner-copy"
          onClick={handleCopyPixOnly}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 shrink-0 transition shadow-2xs"
        >
          {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedPix ? 'Copiada!' : 'Copiar Chave'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Detalhado (Prazos 10/09 e 07/10)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compact')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'compact'
              ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Lista Direta (Nome + Falta Pagar)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reserve_only')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'reserve_only'
              ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-700" /> Só Reserva (10/09)
        </button>
      </div>

      {/* Message Preview Box */}
      <div className="relative">
        <pre className="bg-slate-50 text-slate-800 p-4 rounded-xl text-xs font-mono border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto select-all shadow-inner">
          {textToDisplay}
        </pre>
      </div>
    </div>
  );
};
