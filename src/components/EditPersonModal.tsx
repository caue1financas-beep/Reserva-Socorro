import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  User,
  Building2,
  UtensilsCrossed,
  DollarSign,
  AlertTriangle,
  Loader2,
  Calculator,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency, getPersonDeadlineBreakdown } from '../utils/formatters';
import { EditableField, recalculatePersonValues } from '../utils/calculations';

interface EditPersonModalProps {
  person: PersonDebt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPerson: PersonDebt) => void | Promise<void>;
  onDelete?: (personId: string) => void | Promise<void>;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  person,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [draft, setDraft] = useState<PersonDebt | null>(null);

  // Delete confirmation & loading state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft whenever person or isOpen changes
  useEffect(() => {
    if (person && isOpen) {
      setDraft({ ...person });
      setIsConfirmingDelete(false);
      setIsDeleting(false);
      setIsSaving(false);
    }
  }, [person, isOpen]);

  if (!isOpen || !draft) return null;

  const handleFieldChange = (field: EditableField, val: any) => {
    setDraft((prev) => (prev ? recalculatePersonValues(prev, field, val) : prev));
  };

  const b = getPersonDeadlineBreakdown(draft);
  const isFullyPaid = draft.pendingAmount <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    setIsSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !draft) return;
    setIsDeleting(true);
    try {
      await onDelete(draft.id);
      setIsConfirmingDelete(false);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir participante:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="edit-person-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="edit-person-modal-card"
        className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Edição Completa
              </span>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Calculator className="w-3 h-3 text-slate-400" /> Cálculos Automáticos
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">Editar Dados de {draft.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Informação explicativa */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
            <Calculator className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Todos os campos são editáveis com cálculo dinâmico:</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Altere o <strong>Total Previsto</strong>, a <strong>Reserva</strong>, a <strong>Alimentação</strong>, o <strong>Total Pago</strong> ou o <strong>Saldo Pendente</strong>. Todos se ajustam e recalculam reciprocamente.
              </p>
            </div>
          </div>

          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Participante
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-semibold text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={draft.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium bg-white"
              >
                <option value="adulto">Adulto</option>
                <option value="crianca_outros">Criança / Outros</option>
              </select>
            </div>
          </div>

          {/* Valores Esperados / Pacote */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 block">Valores do Pacote (Parcelas e Total)</span>
              <span className="text-[11px] text-slate-500">Reserva + Alimentação = Total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Parcela 1: Reserva */}
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-600" /> 1ª Parcela: Reserva (10/09)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.expectedReserve}
                    onChange={(e) => handleFieldChange('expectedReserve', e.target.value)}
                    className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {b.isReservePaid ? (
                    <span className="text-emerald-700 font-bold">✓ Reserva quitada</span>
                  ) : (
                    <span className="text-amber-800">Falta {formatCurrency(b.pendingReserve)}</span>
                  )}
                </div>
              </div>

              {/* Parcela 2: Alimentação */}
              <div>
                <label className="block text-[11px] font-semibold text-sky-900 mb-1 flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3 text-sky-600" /> 2ª Parcela: Alim. (07/10)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.expectedFood}
                    onChange={(e) => handleFieldChange('expectedFood', e.target.value)}
                    className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:border-sky-500"
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {b.isFoodPaid ? (
                    <span className="text-emerald-700 font-bold">✓ Alim. quitada</span>
                  ) : (
                    <span className="text-sky-800">Falta {formatCurrency(b.pendingFood)}</span>
                  )}
                </div>
              </div>

              {/* Total Previsto (Também Editável!) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-emerald-600" /> Total Previsto por Pessoa
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.totalExpected}
                    onChange={(e) => handleFieldChange('totalExpected', e.target.value)}
                    className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-emerald-300 bg-white font-black text-emerald-950 outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Total individual do pacote
                </div>
              </div>
            </div>
          </div>

          {/* Pagamento e Saldo Devedor (Ambos Editáveis!) */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Situação de Pagamento
              </span>
              {/* Ações rápidas de quitação */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFieldChange('status', 'quitado')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Quitar Tudo ({formatCurrency(draft.totalExpected)})
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('paidAmount', draft.expectedReserve)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition cursor-pointer"
                >
                  Quitar Reserva ({formatCurrency(draft.expectedReserve)})
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('status', 'pendente_total')}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition cursor-pointer flex items-center gap-1"
                  title="Zerar valor pago"
                >
                  <RotateCcw className="w-3 h-3" /> Zerar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Valor Efetivamente Já Pago (Editável) */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                  Total Efetivamente Já Pago (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-emerald-800 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.paidAmount}
                    onChange={(e) => handleFieldChange('paidAmount', e.target.value)}
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-emerald-300 bg-white font-extrabold text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Saldo Individual / Pendência (Também Editável!) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Saldo Individual / Valor Pendente (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={draft.pendingAmount}
                    onChange={(e) => handleFieldChange('pendingAmount', e.target.value)}
                    className={`w-full text-sm pl-9 pr-3 py-2 rounded-xl border bg-white font-black outline-none focus:ring-1 ${
                      isFullyPaid
                        ? 'border-emerald-300 text-emerald-700 focus:ring-emerald-500'
                        : 'border-rose-300 text-rose-700 focus:ring-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Status Summary Banner */}
            <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-200/80 text-emerald-950">
              <span className="font-semibold">Situação do Participante:</span>
              <span className={`font-black text-sm flex items-center gap-1 ${isFullyPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
                {draft.pendingAmount < 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Quitado (+{formatCurrency(Math.abs(draft.pendingAmount))} crédito)</span>
                  </>
                ) : draft.pendingAmount === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Quitado 🎉</span>
                  </>
                ) : (
                  <span>Pendente: Falta {formatCurrency(draft.pendingAmount)}</span>
                )}
              </span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações (Opcional)</label>
            <input
              type="text"
              value={draft.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Ex: Pagou via Pix em 06/10..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none focus:border-emerald-500 bg-white text-slate-800"
            />
          </div>

          {/* Confirmation Box when user clicks Excluir */}
          {isConfirmingDelete && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 space-y-2.5 animate-fade-in shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-950">
                    Confirmar exclusão de <span className="underline">{draft.name}</span>?
                  </p>
                  <p className="text-rose-700 text-[11px] mt-0.5">
                    Esta ação removerá o participante e suas informações permanentemente do sistema.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-person"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sim, Excluir Participante</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            {onDelete && !isConfirmingDelete ? (
              <button
                type="button"
                id="btn-trigger-delete-person"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 rounded-xl transition border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Excluir Participante
              </button>
            ) : <div />}

            <div className="flex w-full sm:w-auto gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                id="btn-save-edited-person"
                disabled={isSaving || isDeleting}
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
