import React from 'react';
import { Receipt } from 'lucide-react';

interface HeaderProps {
  onOpenShareModal?: () => void;
  onResetData?: () => void;
  onAddNewPerson?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <header id="app-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
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
      </div>
    </header>
  );
};
