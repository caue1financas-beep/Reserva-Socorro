import React, { useState, useEffect } from 'react';
import { INITIAL_DEBT_DATA } from './data/initialData';
import { PersonDebt } from './types';
import { Header } from './components/Header';
import { SummaryHighlights } from './components/SummaryHighlights';
import { DebtTable } from './components/DebtTable';
import { PaymentModal } from './components/PaymentModal';
import { ShareSummaryModal } from './components/ShareSummaryModal';
import { AddPersonModal } from './components/AddPersonModal';

const STORAGE_KEY = 'reserva_debitos_data_v2';

export default function App() {
  const [data, setData] = useState<PersonDebt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved debt data', e);
    }
    return INITIAL_DEBT_DATA;
  });

  const [selectedPersonForPayment, setSelectedPersonForPayment] = useState<PersonDebt | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving debt data to storage', e);
    }
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSavePayment = (personId: string, newPaidAmount: number, notes?: string) => {
    setData((prev) =>
      prev.map((person) => {
        if (person.id === personId) {
          const pending = Math.max(0, person.totalExpected - newPaidAmount);
          let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
          if (pending === 0) status = 'quitado';
          else if (newPaidAmount > 0) status = 'parcial';

          return {
            ...person,
            paidAmount: newPaidAmount,
            pendingAmount: pending,
            status,
            notes: notes !== undefined ? notes : person.notes,
            lastPaymentDate: new Date().toISOString(),
          };
        }
        return person;
      })
    );
    showToast('Pagamento atualizado com sucesso!');
  };

  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja restaurar os valores originais da planilha?')) {
      setData(INITIAL_DEBT_DATA);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      showToast('Dados restaurados para o estado original da planilha!');
    }
  };

  const handleAddPerson = (newPersonData: Omit<PersonDebt, 'id'>) => {
    const newPerson: PersonDebt = {
      ...newPersonData,
      id: Date.now().toString(),
    };
    setData((prev) => [...prev, newPerson]);
    showToast(`Participante ${newPerson.name} adicionado com sucesso!`);
  };

  return (
    <div id="main-app" className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-banner"
          className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400 animate-fade-in flex items-center gap-2"
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <Header
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onResetData={handleResetData}
          onAddNewPerson={() => setIsAddModalOpen(true)}
        />

        {/* Highlight Insights */}
        <section id="section-highlights" aria-label="Destaques e Resumo de Quitação">
          <SummaryHighlights
            data={data}
            onOpenPaymentModal={(p) => setSelectedPersonForPayment(p)}
          />
        </section>

        {/* Full Debt & Payment Interactive Table */}
        <section id="section-table" aria-label="Tabela Detalhada de Participantes">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Detalhamento Completo por Participante
              </h2>
              <p className="text-xs text-slate-400">
                Visualize quem já pagou, quanto falta para cada um e atualize os recebimentos
              </p>
            </div>
          </div>
          <DebtTable
            data={data}
            onOpenPaymentModal={(person) => setSelectedPersonForPayment(person)}
          />
        </section>
      </main>

      {/* Modals */}
      <PaymentModal
        person={selectedPersonForPayment}
        onClose={() => setSelectedPersonForPayment(null)}
        onSavePayment={handleSavePayment}
      />

      <ShareSummaryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={data}
      />

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPerson}
      />
    </div>
  );
}
