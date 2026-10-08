import React, { useState } from 'react';
import { Receipt, QrCode, Copy, Check, Lock, Unlock, LogOut, UserPlus } from 'lucide-react';
import { PIX_CONFIG } from '../utils/formatters';

interface HeaderProps {
  onOpenShareModal?: () => void;
  onResetData?: () => void;
  onAddNewPerson?: () => void;
  isAuthenticated: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNewPerson,
  isAuthenticated,
  onOpenLoginModal,
  onLogout,
}) => {
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
    <header id="app-header" className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-200">
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

      {/* Right side controls: Pix + Edit with Login */}
      <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
        {/* Pix Quick Access Badge */}
        <button
          type="button"
          id="btn-header-copy-pix"
          onClick={handleCopyPix}
          title="Clique para copiar apenas a chave Pix"
          className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl px-3 py-2 flex items-center gap-2 transition shadow-2xs group text-left"
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
          <div className="ml-1 pl-2 border-l border-slate-200 text-slate-500 group-hover:text-slate-800 flex items-center gap-1 text-xs font-medium">
            {copiedPix ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copiada</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </div>
        </button>

        {/* Editar Button on the Right Side */}
        {!isAuthenticated ? (
          <button
            type="button"
            id="btn-header-edit-mode"
            onClick={onOpenLoginModal}
            className="bg-white hover:bg-amber-50 border border-amber-300 hover:border-amber-400 text-amber-900 rounded-xl px-3.5 py-2 flex items-center gap-2.5 transition shadow-2xs group"
            title="Clique para autenticar e habilitar modo de edição"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Acesso Restrito
              </div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Editar</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Unlock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-emerald-800 leading-tight">Modo Edição Ativo</div>
                <div className="text-[11px] font-semibold text-emerald-950">Administrador</div>
              </div>
            </div>

            {onAddNewPerson && (
              <button
                type="button"
                onClick={onAddNewPerson}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="Adicionar novo participante"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Novo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 p-2 rounded-xl text-xs font-semibold transition"
              title="Sair do modo de edição (bloquear)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
