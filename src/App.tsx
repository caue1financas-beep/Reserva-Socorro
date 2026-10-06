import React, { useState, useEffect } from 'react';
import { INITIAL_DEBT_DATA } from './data/initialData';
import { PersonDebt } from './types';
import { Header } from './components/Header';
import { WhatsAppSummarySection } from './components/WhatsAppSummarySection';
import { CashFlowCard } from './components/CashFlowCard';
import { SummaryHighlights } from './components/SummaryHighlights';
import { DebtTable } from './components/DebtTable';
import { PaymentModal } from './components/PaymentModal';
import { ShareSummaryModal } from './components/ShareSummaryModal';
import { AddPersonModal } from './components/AddPersonModal';

const STORAGE_KEY = 'reserva_debitos_data_v16';

export default function App() {
  const [data, setData] = useState<PersonDebt[]>(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('reserva_debitos_data_v15') ||
        localStorage.getItem('reserva_debitos_data_v14') ||
        localStorage.getItem('reserva_debitos_data_v13') ||
        localStorage.getItem('reserva_debitos_data_v12') ||
        localStorage.getItem('reserva_debitos_data_v11') ||
        localStorage.getItem('reserva_debitos_data_v10');
      if (saved) {
        let parsed: PersonDebt[] = JSON.parse(saved);
        // Exclude vacancies
        parsed = parsed.filter(
          (p) => !p.name.toLowerCase().includes('vaga') && !p.name.toLowerCase().includes('disponível')
        );

        // Ensure Cleide exists with defined values (56 reserva, 120 refeição, 176 pago, quitada)
        const cleideIndex = parsed.findIndex((p) => p.name.toLowerCase() === 'cleide');
        const cleideData: PersonDebt = {
          id: '14',
          name: 'Cleide',
          category: 'adulto',
          expectedReserve: 56,
          expectedFood: 120,
          totalExpected: 176,
          paidAmount: 176,
          pendingAmount: 0,
          status: 'quitado',
        };

        if (cleideIndex === -1) {
          const mariIndex = parsed.findIndex((p) => p.name.toLowerCase() === 'mari');
          if (mariIndex !== -1) {
            parsed = [...parsed.slice(0, mariIndex + 1), cleideData, ...parsed.slice(mariIndex + 1)];
          } else {
            parsed.push(cleideData);
          }
        } else {
          parsed[cleideIndex] = {
            ...parsed[cleideIndex],
            expectedReserve: 56,
            expectedFood: 120,
            totalExpected: 176,
            paidAmount: 176,
            pendingAmount: 0,
            status: 'quitado',
          };
        }

        // Ensure Léo exists with defined values (0 reserva, 30 refeição, 30 pago, 0 pendente - 100% quitado)
        const leoIndex = parsed.findIndex((p) => p.name.toLowerCase() === 'léo' || p.name.toLowerCase() === 'leo');
        const leoData: PersonDebt = {
          id: '23',
          name: 'Léo',
          category: 'crianca_outros',
          expectedReserve: 0,
          expectedFood: 30,
          totalExpected: 30,
          paidAmount: 30,
          pendingAmount: 0,
          status: 'quitado',
        };

        if (leoIndex === -1) {
          parsed.push(leoData);
        } else {
          parsed[leoIndex] = {
            ...parsed[leoIndex],
            name: 'Léo',
            category: 'crianca_outros',
            expectedReserve: 0,
            expectedFood: 30,
            totalExpected: 30,
            paidAmount: 30,
            pendingAmount: 0,
            status: 'quitado',
          };
        }

        // Ensure latest payments for Beatriz, Miriam and Carol are applied
        return parsed.map((p) => {
          if (p.name.toLowerCase() === 'carol' && p.paidAmount < 308) {
            return {
              ...p,
              paidAmount: 308,
              pendingAmount: 0,
              status: 'quitado' as const,
            };
          }
          if (p.name.toLowerCase() === 'beatriz' && p.paidAmount === 150) {
            return {
              ...p,
              paidAmount: 270,
              pendingAmount: 38,
              status: 'parcial' as const,
            };
          }
          if (p.name.toLowerCase() === 'miriam' && p.paidAmount < 308) {
            return {
              ...p,
              paidAmount: 308,
              pendingAmount: 0,
              status: 'quitado' as const,
            };
          }
          return p;
        });
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
    <div id="main-app" className="min-h-screen bg-slate-100/90 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-banner"
          className="fixed top-5 right-5 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500 animate-fade-in flex items-center gap-2"
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Header */}
        <Header
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onResetData={handleResetData}
          onAddNewPerson={() => setIsAddModalOpen(true)}
        />

        {/* Cash Flow & Account Balance Section */}
        <section id="section-cashflow" aria-label="Fluxo de Caixa e Saldo em Conta">
          <CashFlowCard data={data} />
        </section>

        {/* WhatsApp Ready-to-Send Summary Box */}
        <section id="section-whatsapp-summary" aria-label="Resumo para WhatsApp">
          <WhatsAppSummarySection data={data} />
        </section>

        {/* Highlight Insights */}
        <section id="section-highlights" aria-label="Destaques e Resumo de Quitação">
          <SummaryHighlights
            data={data}
            onOpenPaymentModal={(p) => setSelectedPersonForPayment(p)}
          />
        </section>

        {/* Full Debt & Payment Interactive Table */}
        <section id="section-table" aria-label="Tabela Detalhada de Participantes">
          <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Detalhamento Completo por Participante
              </h2>
              <p className="text-xs text-slate-500">
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
