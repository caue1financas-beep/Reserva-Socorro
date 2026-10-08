import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, User, Building2, UtensilsCrossed, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { PersonDebt } from '../types';
import { formatCurrency } from '../utils/formatters';

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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'adulto' | 'crianca_outros'>('adulto');
  const [expectedReserve, setExpectedReserve] = useState('0');
  const [expectedFood, setExpectedFood] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');

  // Delete confirmation & loading state (avoids window.confirm which is blocked in iframes)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever person or isOpen changes
  useEffect(() => {
    if (person && isOpen) {
      setName(person.name);
      setCategory(person.category);
      setExpectedReserve(person.expectedReserve.toString());
      setExpectedFood(person.expectedFood.toString());
      setPaidAmount(person.paidAmount.toString());
      setNotes(person.notes || '');
      setIsConfirmingDelete(false);
      setIsDeleting(false);
      setIsSaving(false);
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const numReserve = parseFloat(expectedReserve) || 0;
  const numFood = parseFloat(expectedFood) || 0;
  const numPaid = parseFloat(paidAmount) || 0;
  const totalExpected = numReserve + numFood;
  const pendingAmount = totalExpected - numPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
    if (pendingAmount <= 0) status = 'quitado';
    else if (numPaid > 0) status = 'parcial';

    const updatedPerson: PersonDebt = {
      ...person,
      name: name.trim() || person.name,
      category,
      expectedReserve: numReserve,
      expectedFood: numFood,
      totalExpected,
      paidAmount: numPaid,
      pendingAmount,
      status,
      notes: notes.trim() ? notes.trim() : undefined,
      lastPaymentDate: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await onSave(updatedPerson);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickPayFull = () => {
    setPaidAmount(totalExpected.toString());
  };

  const handleQuickPayReserve = () => {
    setPaidAmount(numReserve.toString());
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !person) return;
    setIsDeleting(true);
    try {
      await onDelete(person.id);
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
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Modo Edição (Autenticado)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Editar Dados de {person.name}</h3>
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
          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Participante
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'adulto' | 'crianca_outros')}
                className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-medium bg-white"
              >
                <option value="adulto">Adulto</option>
                <option value="crianca_outros">Criança / Outros</option>
              </select>
            </div>
          </div>

          {/* Valores Esperados */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Valores Esperados do Pacote</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    value={expectedReserve}
                    onChange={(e) => setExpectedReserve(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sky-900 mb-1 flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3 text-sky-600" /> 2ª Parcela: Alimentação (07/10)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expectedFood}
                    onChange={(e) => setExpectedFood(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Total Esperado (Soma):</span>
              <span className="font-extrabold text-sm text-slate-900">{formatCurrency(totalExpected)}</span>
            </div>
          </div>

          {/* Valor Já Pago */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" /> Valor Efetivamente Já Pago
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleQuickPayReserve}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                >
                  Quitar Reserva ({formatCurrency(numReserve)})
                </button>
                <button
                  type="button"
                  onClick={handleQuickPayFull}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer"
                >
                  Quitar Tudo ({formatCurrency(totalExpected)})
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-emerald-800 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-emerald-300 bg-white font-extrabold text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200 text-emerald-900">
              <span>Saldo Individual / Pendência:</span>
              <span className={`font-black text-sm ${pendingAmount <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {pendingAmount < 0
                  ? `Quitado (+${formatCurrency(Math.abs(pendingAmount))} crédito)`
                  : pendingAmount === 0
                  ? '100% Quitado 🎉'
                  : `Falta ${formatCurrency(pendingAmount)}`}
              </span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Observações (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagou via Pix em 06/10..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
            />
          </div>

          {/* Confirmation Box when user clicks Excluir */}
          {isConfirmingDelete && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3.5 space-y-2.5 animate-fade-in shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-rose-950">
                    Confirmar exclusão de <span className="underline">{person.name}</span>?
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
