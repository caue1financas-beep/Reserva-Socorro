import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { PersonDebt } from '../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPerson: Omit<PersonDebt, 'id'>) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'adulto' | 'crianca_outros'>('adulto');
  const [expectedReserve, setExpectedReserve] = useState('188');
  const [expectedFood, setExpectedFood] = useState('120');
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');

  const handleCategoryChange = (cat: 'adulto' | 'crianca_outros') => {
    setCategory(cat);
    if (cat === 'adulto') {
      setExpectedReserve('188');
      setExpectedFood('120');
    } else {
      setExpectedReserve('0');
      setExpectedFood('30');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const reserve = parseFloat(expectedReserve) || 0;
    const food = parseFloat(expectedFood) || 0;
    const total = reserve + food;
    const paid = parseFloat(paidAmount) || 0;
    const pending = Math.max(0, total - paid);

    let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
    if (pending === 0) status = 'quitado';
    else if (paid > 0) status = 'parcial';

    onAdd({
      name: name.trim(),
      category,
      expectedReserve: reserve,
      expectedFood: food,
      totalExpected: total,
      paidAmount: paid,
      pendingAmount: pending,
      status,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div id="add-person-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div id="add-person-modal-card" className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Adicionar Participante</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Nome do Participante
            </label>
            <input
              id="new-person-name"
              type="text"
              required
              placeholder="Ex: Gabriel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Categoria / Pacote
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('adulto')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'adulto'
                    ? 'bg-slate-800 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Adulto</div>
                <div className="text-[11px] text-slate-400">Total: R$ 308 (188+120)</div>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('crianca_outros')}
                className={`p-3 rounded-xl border text-left transition ${
                  category === 'crianca_outros'
                    ? 'bg-slate-800 border-cyan-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs">Criança / Taxa</div>
                <div className="text-[11px] text-slate-400">Total: R$ 30 (Alimentação)</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reserva (R$)
              </label>
              <input
                type="number"
                step="any"
                value={expectedReserve}
                onChange={(e) => setExpectedReserve(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Alimentação (R$)
              </label>
              <input
                type="number"
                step="any"
                value={expectedFood}
                onChange={(e) => setExpectedFood(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Valor Já Pago Inicialmente (R$)
            </label>
            <input
              type="number"
              step="any"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Convidado do Lucas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
