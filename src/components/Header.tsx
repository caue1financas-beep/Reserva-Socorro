import React, { useState } from 'react';
import { Receipt, QrCode, Copy, Check } from 'lucide-react';
import { PIX_CONFIG } from '../utils/formatters';

interface HeaderProps {
  onOpenShareModal?: () => void;
  onResetData?: () => void;
  onAddNewPerson?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CONFIG.key);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header id="app-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Controle Financeiro da Reserva
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Acompanhamento de arrecadação por participante (Reserva + Alimentação)
          </p>
        </div>
      </div>

      {/* Pix Quick Access Badge */}
      <div className="flex items-center">
        <button
          type="button"
          id="btn-header-copy-pix"
          onClick={handleCopyPix}
          title="Clique para copiar apenas a chave Pix"
          className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2 flex items-center gap-2.5 transition shadow-2xs group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Chave Pix ({PIX_CONFIG.bank})
            </div>
            <div className="text-xs font-semibold text-slate-900">
              {PIX_CONFIG.holder}
            </div>
          </div>
          <div className="ml-2 pl-2 border-l border-slate-200 text-slate-500 group-hover:text-slate-800 flex items-center gap-1 text-xs font-medium">
            {copiedPix ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
