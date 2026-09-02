import React, { useState } from 'react';
import { Copy, Check, MessageSquareText, Calendar, Building2, FileText } from 'lucide-react';
import { PersonDebt } from '../types';
import { generateWhatsAppFullSummary } from '../utils/formatters';

interface WhatsAppSummarySectionProps {
  data: PersonDebt[];
}

export const WhatsAppSummarySection: React.FC<WhatsAppSummarySectionProps> = ({ data }) => {
  const [copiedMode, setCopiedMode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reserve_only' | 'compact'>('all');

  const pendingList = data.filter((p) => p.pendingAmount > 0);
  const totalPendente = data.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const totalArrecadado = data.reduce((acc, curr) => acc + curr.paidAmount, 0);

  // Formatações de mensagens
  const generateCompactList = () => {
    const totalGastos = 500;
    const saldoEmConta = totalArrecadado - totalGastos;

    let msg = `🔴 *VALORES PENDENTES - RESERVA & ALIMENTAÇÃO*\n\n`;
    msg += `💰 *Total Arrecadado (Pix):* R$ ${totalArrecadado.toLocaleString('pt-BR')},00\n`;
    msg += `💳 *Adiantamento Pago Reserva:* -R$ 500,00\n`;
    msg += `💵 *Saldo Atual em Conta:* R$ ${saldoEmConta.toLocaleString('pt-BR')},00\n`;
    msg += `⚠️ *Total Geral a Receber:* R$ ${totalPendente.toLocaleString('pt-BR')},00\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*LISTA DE PENDÊNCIAS POR PESSOA:*\n\n`;

    const sorted = [...data]
      .filter((p) => p.pendingAmount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount);

    sorted.forEach((p, idx) => {
      msg += `${idx + 1}. *${p.name}*: Falta *R$ ${p.pendingAmount},00* (Pago: R$ ${p.paidAmount},00)\n`;
    });

    msg += `\n_Favor enviar o comprovante após realizar o Pix!_ 👍`;
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

  return (
    <div id="whatsapp-summary-box" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Resumo Formatado para WhatsApp
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                Copiar e Colar
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {pendingList.length} pessoas com pendências (Total de R$ {totalPendente.toLocaleString('pt-BR')},00)
            </p>
          </div>
        </div>

        {/* Copy CTA Button */}
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
              <Check className="w-4 h-4" /> Copiado para a Área de Transferência!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copiar Mensagem Pronta
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pt-3 pb-2 text-xs">
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
      <div className="relative mt-2">
        <pre className="bg-slate-50 text-slate-800 p-4 rounded-xl text-xs font-mono border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto select-all shadow-inner">
          {textToDisplay}
        </pre>
      </div>
    </div>
  );
};
