import React from 'react';
import { Share2, RotateCcw, Plus, Receipt, Download } from 'lucide-react';
import { PersonDebt } from '../types';

interface HeaderProps {
  onOpenShareModal: () => void;
  onResetData: () => void;
  onAddNewPerson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShareModal,
  onResetData,
  onAddNewPerson,
}) => {
  return (
    <header id="app-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Controle de Débitos da Reserva
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Valores a serem pagos por participante (Reserva + Alimentação)
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          id="btn-reset-data"
          onClick={onResetData}
          title="Restaurar dados originais da planilha"
          className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restaurar Planilha
        </button>

        <button
          type="button"
          id="btn-add-person"
          onClick={onAddNewPerson}
          className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Novo Participante
        </button>

        <button
          type="button"
          id="btn-open-share-summary"
          onClick={onOpenShareModal}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition"
        >
          <Share2 className="w-4 h-4" /> Gerar Resumo p/ Envio
        </button>
      </div>
    </header>
  );
};
