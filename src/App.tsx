import React, { useState, useEffect, useCallback } from 'react';
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
import { LoginModal } from './components/LoginModal';
import { EditPersonModal } from './components/EditPersonModal';
import {
  fetchPersons,
  updatePersonApi,
  deletePersonApi,
  addPersonApi,
  resetPersonsApi,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from './services/api';

const STORAGE_KEY = 'reserva_debitos_data_v19';

export default function App() {
  const [data, setData] = useState<PersonDebt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersonDebt[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved debt data', e);
    }
    return INITIAL_DEBT_DATA;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredToken());

  const [selectedPersonForPayment, setSelectedPersonForPayment] = useState<PersonDebt | null>(null);
  const [personBeingEdited, setPersonBeingEdited] = useState<PersonDebt | null>(null);
  const [pendingPersonToEdit, setPendingPersonToEdit] = useState<PersonDebt | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize from backend on mount and periodically for global persistence across all visitors
  const loadServerData = useCallback(async (quiet = false) => {
    try {
      const serverPersons = await fetchPersons();
      if (Array.isArray(serverPersons) && serverPersons.length > 0) {
        setData(serverPersons);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverPersons));
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      if (!quiet) {
        console.warn('Backend sync error (using local cache):', err?.message);
      }
    }
  }, []);

  useEffect(() => {
    loadServerData();
    // Poll every 12 seconds to ensure global visibility for all users
    const interval = setInterval(() => {
      loadServerData(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [loadServerData]);

  // Sync state to local storage as fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving debt data to storage', e);
    }
  }, [data]);

  const handleLoginSuccess = (token?: string) => {
    setIsAuthenticated(true);
    if (token) {
      setAuthToken(token);
      setStoredToken(token);
    }
    showToast('Modo de edição liberado com sucesso!');
    if (pendingPersonToEdit) {
      setPersonBeingEdited(pendingPersonToEdit);
      setPendingPersonToEdit(null);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    removeStoredToken();
    showToast('Modo de edição bloqueado.');
  };

  const handleSaveEditedPerson = async (updated: PersonDebt) => {
    try {
      // Send changes (expectedFood, expectedReserve, name, etc.) to backend
      const savedOnServer = await updatePersonApi(updated.id, updated, authToken || undefined);
      setData((prev) =>
        prev.map((item) => (item.id === savedOnServer.id ? savedOnServer : item))
      );
      showToast(`Dados de ${savedOnServer.name} salvos com sucesso no servidor!`);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Não autorizado') || err.message?.includes('401')) {
        handleLogout();
        setIsLoginModalOpen(true);
        showToast('Sessão expirada. Faça login novamente para salvar.', true);
      } else {
        // Optimistic local update fallback
        setData((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        showToast(`Salvo localmente. (${err.message})`, true);
      }
    }
  };

  const handleDeletePerson = async (personId: string) => {
    try {
      const token = authToken || getStoredToken();
      await deletePersonApi(personId, token || undefined);
      setData((prev) => prev.filter((p) => String(p.id) !== String(personId)));
      showToast('Participante excluído com sucesso!');
    } catch (err: any) {
      console.error('Delete error:', err);
      if (err.message?.includes('Não autorizado') || err.message?.includes('401')) {
        handleLogout();
        setIsLoginModalOpen(true);
        showToast('Sessão expirada. Faça login novamente para excluir.', true);
      } else {
        setData((prev) => prev.filter((p) => String(p.id) !== String(personId)));
        showToast('Excluído localmente. Falha ao sincronizar com servidor.', true);
      }
    }
  };

  const handleSavePayment = async (personId: string, newPaidAmount: number, notes?: string) => {
    const existing = data.find((p) => p.id === personId);
    if (!existing) return;

    const pending = existing.totalExpected - newPaidAmount;
    let status: 'quitado' | 'parcial' | 'pendente_total' = 'pendente_total';
    if (pending <= 0) status = 'quitado';
    else if (newPaidAmount > 0) status = 'parcial';

    const updates: Partial<PersonDebt> = {
      paidAmount: newPaidAmount,
      pendingAmount: pending,
      status,
      notes: notes !== undefined ? notes : existing.notes,
      lastPaymentDate: new Date().toISOString(),
    };

    try {
      const token = authToken || getStoredToken();
      const saved = await updatePersonApi(personId, updates, token || undefined);
      setData((prev) =>
        prev.map((p) => (p.id === personId ? saved : p))
      );
      showToast('Pagamento atualizado com sucesso no servidor!');
    } catch (err: any) {
      console.error(err);
      setData((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, ...updates } : p))
      );
      showToast('Pagamento salvo localmente.', true);
    }
  };

  const handleExecuteResetData = async () => {
    setIsResetModalOpen(false);
    try {
      const token = authToken || getStoredToken();
      const fresh = await resetPersonsApi(token || undefined);
      setData(fresh);
      showToast('Dados restaurados para o estado original da planilha!');
    } catch {
      setData(INITIAL_DEBT_DATA);
      showToast('Dados restaurados localmente!');
    }
  };

  const handleAddPerson = async (newPersonData: Omit<PersonDebt, 'id'>) => {
    try {
      const created = await addPersonApi(newPersonData, authToken || undefined);
      setData((prev) => [...prev, created]);
      showToast(`Participante ${created.name} adicionado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      const fallbackPerson: PersonDebt = {
        ...newPersonData,
        id: Date.now().toString(),
      };
      setData((prev) => [...prev, fallbackPerson]);
      showToast(`Participante adicionado localmente.`, true);
    }
  };

  return (
    <div id="main-app" className="min-h-screen bg-slate-100/90 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-banner"
          className={`fixed top-5 right-5 z-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl animate-fade-in flex items-center gap-2 border ${
            toastMessage.isError
              ? 'bg-rose-700 border-rose-500'
              : 'bg-emerald-700 border-emerald-500'
          }`}
        >
          <span>{toastMessage.isError ? '⚠️' : '✓'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Header */}
        <Header
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onResetData={() => setIsResetModalOpen(true)}
          onAddNewPerson={() => {
            if (isAuthenticated) {
              setIsAddModalOpen(true);
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          isAuthenticated={isAuthenticated}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
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
            onOpenPaymentModal={(p) => {
              if (isAuthenticated) {
                setPersonBeingEdited(p);
              } else {
                setPendingPersonToEdit(p);
                setIsLoginModalOpen(true);
              }
            }}
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
            isAuthenticated={isAuthenticated}
            onEditPerson={(person) => setPersonBeingEdited(person)}
            onRequireAuth={(person) => {
              setPendingPersonToEdit(person);
              setIsLoginModalOpen(true);
            }}
          />
        </section>
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingPersonToEdit(null);
        }}
        onSuccess={handleLoginSuccess}
      />

      <EditPersonModal
        person={personBeingEdited}
        isOpen={!!personBeingEdited}
        onClose={() => setPersonBeingEdited(null)}
        onSave={handleSaveEditedPerson}
        onDelete={handleDeletePerson}
      />

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

      {/* Confirmation Modal for Resetting to Initial Data */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Restaurar Valores Originais?</h3>
            <p className="text-xs text-slate-600">
              Tem certeza que deseja restaurar os valores originais da planilha? Todas as alterações manuais serão resetadas para o estado inicial.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteResetData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
