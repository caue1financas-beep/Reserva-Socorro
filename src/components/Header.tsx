import React, { useState } from 'react';
import { Receipt, QrCode, Copy, Check, Edit3, UserPlus, Eye } from 'lucide-react';
import { PIX_CONFIG } from '../utils/formatters';

interface HeaderProps {
  onOpenShareModal?: () => void;
  onResetData?: () => void;
  onAddNewPerson?: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNewPerson,
  isEditMode,
  onToggleEditMode,
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

      {/* Right side controls: Pix + Edit Function Toggle */}
      <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
        {/* Pix Quick Access Badge */}
        <button
          type="button"
          id="btn-header-copy-pix"
          onClick={handleCopyPix}
          title="Clique para copiar apenas a chave Pix"
          className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl px-3 py-2 flex items-center gap-2 transition shadow-2xs group text-left cursor-pointer"
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

        {/* Edit Function Toggle (No password required) */}
        {!isEditMode ? (
          <button
            type="button"
            id="btn-header-enable-edit"
            onClick={onToggleEditMode}
            className="bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-500 text-slate-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5 transition shadow-2xs group cursor-pointer"
            title="Habilitar função de edição para alterar valores e participantes"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center shrink-0 transition">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Função de Edição
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1 transition">
                <span>Habilitar Edição</span>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {onAddNewPerson && (
              <button
                type="button"
                id="btn-header-add-person"
                onClick={onAddNewPerson}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Adicionar novo participante à lista"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Novo Participante</span>
              </button>
            )}

            <button
              type="button"
              id="btn-header-finish-edit"
              onClick={onToggleEditMode}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 hover:border-slate-400 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Concluir e voltar ao modo de visualização protegida"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Concluir Edição</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
