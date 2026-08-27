import React from 'react';
import { Receipt } from 'lucide-react';

interface HeaderProps {
  onOpenShareModal?: () => void;
  onResetData?: () => void;
  onAddNewPerson?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
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
    </header>
  );
};
