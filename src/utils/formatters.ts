import { PersonDebt } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export interface DeadlineBreakdown {
  reserveExpected: number;
  paidForReserve: number;
  pendingReserve: number;
  isReservePaid: boolean;
  foodExpected: number;
  paidForFood: number;
  pendingFood: number;
  isFoodPaid: boolean;
  totalPaid: number;
  totalPending: number;
}

export function getPersonDeadlineBreakdown(person: PersonDebt): DeadlineBreakdown {
  const reserveExpected = person.expectedReserve;
  const paidForReserve = Math.min(person.paidAmount, reserveExpected);
  const pendingReserve = Math.max(0, reserveExpected - person.paidAmount);
  const isReservePaid = pendingReserve === 0;

  const foodExpected = person.expectedFood;
  const paidForFood = Math.min(foodExpected, Math.max(0, person.paidAmount - reserveExpected));
  const pendingFood = Math.max(0, foodExpected - paidForFood);
  const isFoodPaid = pendingFood === 0;

  return {
    reserveExpected,
    paidForReserve,
    pendingReserve,
    isReservePaid,
    foodExpected,
    paidForFood,
    pendingFood,
    isFoodPaid,
    totalPaid: person.paidAmount,
    totalPending: person.pendingAmount,
  };
}

export const OFFICIAL_RESERVE_TARGET = 3000;
export const ADVANCE_RESERVE_EXPENSE = 500;

export const PIX_CONFIG = {
  bank: 'Banco Inter',
  holder: 'Cauê Pavanelli',
  key: 'b235f650-d1b3-4854-952a-bf6b4a949c70',
  type: 'Aleatória',
};

export function getPixFormattedBlock(): string {
  let block = `━━━━━━━━━━━━━━━━━━━━━\n`;
  block += `📱 *DADOS PARA PAGAMENTO VIA PIX*\n`;
  block += `🏦 *Banco:* ${PIX_CONFIG.bank}\n`;
  block += `👤 *Titular:* ${PIX_CONFIG.holder}\n`;
  block += `🔑 *Chave Pix (${PIX_CONFIG.type}):*\n`;
  block += `${PIX_CONFIG.key}\n\n`;
  block += `_Favor enviar o comprovante após a transferência para baixa no sistema!_ 👍`;
  return block;
}

export function generateWhatsAppFullSummary(
  items: PersonDebt[],
  mode: 'all_deadlines' | 'reserve_focus' | 'food_focus' = 'all_deadlines'
): string {
  const totalEsperadoReserva = OFFICIAL_RESERVE_TARGET; // R$ 3.000,00 oficial sem sobra
  const totalPagoReserva = items.reduce((acc, curr) => acc + getPersonDeadlineBreakdown(curr).paidForReserve, 0);
  const totalPendenteReserva = Math.max(0, totalEsperadoReserva - totalPagoReserva);

  const totalEsperadoAlimentacao = items.reduce((acc, curr) => acc + curr.expectedFood, 0);
  const totalPagoAlimentacao = items.reduce((acc, curr) => acc + getPersonDeadlineBreakdown(curr).paidForFood, 0);
  const totalPendenteAlimentacao = Math.max(0, totalEsperadoAlimentacao - totalPagoAlimentacao);

  const totalGeral = totalEsperadoReserva + totalEsperadoAlimentacao;
  const totalPagoGeral = items.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const saldoEmConta = totalPagoGeral - ADVANCE_RESERVE_EXPENSE;

  if (mode === 'reserve_focus') {
    let msg = `📅 *COBRANÇA: 1ª PARCELA - RESERVA (Vencimento: 10/09)*\n\n`;
    msg += `🏨 *Meta da Reserva:* ${formatCurrency(totalEsperadoReserva)}\n`;
    msg += `✅ *Arrecadado até agora:* ${formatCurrency(totalPagoReserva)}\n`;
    msg += `⚠️ *Falta arrecadar p/ 10/09:* *${formatCurrency(totalPendenteReserva)}*\n\n`;
    msg += `💳 *FLUXO DE CAIXA ATUAL:*\n`;
    msg += `• Total arrecadado: ${formatCurrency(totalPagoGeral)}\n`;
    msg += `• Adiantamento pago da reserva: -${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
    msg += `• *Saldo disponível em conta:* *${formatCurrency(saldoEmConta)}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*QUANTO FALTA CADA UM PAGAR DA RESERVA (ATÉ 10/09):*\n\n`;

    const pendingReservePeople = items
      .map((p) => ({ person: p, breakdown: getPersonDeadlineBreakdown(p) }))
      .filter((item) => item.breakdown.pendingReserve > 0)
      .sort((a, b) => b.breakdown.pendingReserve - a.breakdown.pendingReserve);

    pendingReservePeople.forEach((item, idx) => {
      const p = item.person;
      const b = item.breakdown;
      msg += `${idx + 1}. 🔴 *${p.name}*: Falta *${formatCurrency(b.pendingReserve)}* (Pago: ${formatCurrency(b.paidForReserve)})\n`;
    });

    const paidReservePeople = items.filter((p) => getPersonDeadlineBreakdown(p).isReservePaid);
    if (paidReservePeople.length > 0) {
      msg += `\n🟢 *RESERVA QUITADA (10/09):*\n`;
      paidReservePeople.forEach((p) => {
        msg += `✅ *${p.name}* (OK)\n`;
      });
    }

    msg += `\n_Lembrando: A 2ª parcela (Alimentação) vence em 07/10._\n\n`;
    msg += getPixFormattedBlock();
    return msg;
  }

  // Full / All deadlines
  let message = `📋 *RESUMO FINANCEIRO POR PRAZO DE PAGAMENTO*\n\n`;
  message += `📌 *1ª PARCELA: RESERVA (Vencimento: 10/09)*\n`;
  message += `• Meta da Reserva: ${formatCurrency(totalEsperadoReserva)}\n`;
  message += `• Já Pago da Reserva: ${formatCurrency(totalPagoReserva)}\n`;
  message += `• *FALTA ARRECADAR (até 10/09): ${formatCurrency(totalPendenteReserva)}*\n\n`;

  message += `📌 *2ª PARCELA: ALIMENTAÇÃO (Vencimento: 07/10)*\n`;
  message += `• Total da Alimentação: ${formatCurrency(totalEsperadoAlimentacao)}\n`;
  message += `• Já Pago da Alimentação: ${formatCurrency(totalPagoAlimentacao)}\n`;
  message += `• *Falta Arrecadar (até 07/10): ${formatCurrency(totalPendenteAlimentacao)}*\n\n`;

  message += `💳 *SALDO EM CONTA & GASTOS:*\n`;
  message += `• Total Arrecadado: ${formatCurrency(totalPagoGeral)}\n`;
  message += `• (-) Adiantamento Pago da Reserva: ${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
  message += `• 👉 *SALDO ATUAL EM CONTA: ${formatCurrency(saldoEmConta)}*\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔴 *DETALHAMENTO POR PESSOA:*\n\n`;

  const sortedList = [...items].sort((a, b) => b.pendingAmount - a.pendingAmount);

  sortedList.forEach((person, idx) => {
    const b = getPersonDeadlineBreakdown(person);
    const statusIcon = person.pendingAmount === 0 ? '🟢' : b.pendingReserve > 0 ? '🔴' : '🟡';

    message += `${idx + 1}. ${statusIcon} *${person.name}*\n`;
    if (b.reserveExpected > 0) {
      if (b.isReservePaid) {
        message += `   • 🏨 Reserva (10/09): ✅ *QUITADA* (${formatCurrency(b.reserveExpected)})\n`;
      } else {
        message += `   • 🏨 Reserva (10/09): ⚠️ *Falta ${formatCurrency(b.pendingReserve)}* (Pago: ${formatCurrency(b.paidForReserve)} de ${formatCurrency(b.reserveExpected)})\n`;
      }
    } else {
      message += `   • 🏨 Reserva (10/09): Isento (R$ 0,00)\n`;
    }

    if (b.isFoodPaid) {
      message += `   • 🍽️ Alimentação (07/10): ✅ *QUITADA* (${formatCurrency(b.foodExpected)})\n`;
    } else {
      message += `   • 🍽️ Alimentação (07/10): ⚠️ *Falta ${formatCurrency(b.pendingFood)}* (Pago: ${formatCurrency(b.paidForFood)} de ${formatCurrency(b.foodExpected)})\n`;
    }

    message += `   👉 *Falta Total:* *${formatCurrency(person.pendingAmount)}* (Já pago: ${formatCurrency(person.paidAmount)})\n\n`;
  });

  message += getPixFormattedBlock();
  return message;
}

export function generateIndividualMessage(person: PersonDebt): string {
  const b = getPersonDeadlineBreakdown(person);

  if (person.pendingAmount <= 0) {
    return `Olá ${person.name}! Passando para confirmar que todas as suas parcelas da reserva e alimentação (Total: ${formatCurrency(person.totalExpected)}) estão 100% QUITADAS! Muito obrigado! 🎉`;
  }

  let msg = `Olá ${person.name}! Segue o status e os prazos de pagamento da sua parte na viagem:\n\n`;

  // Reserva (10/09)
  if (b.reserveExpected > 0) {
    if (b.isReservePaid) {
      msg += `🏨 *1ª Parcela - Reserva (Vencimento 10/09):* ✅ *100% QUITADA!*\n`;
    } else {
      msg += `🏨 *1ª Parcela - Reserva (Vencimento 10/09):*\n• *Valor a pagar até 10/09:* *${formatCurrency(b.pendingReserve)}*\n• (Total reserva: ${formatCurrency(b.reserveExpected)} | Já pago: ${formatCurrency(b.paidForReserve)})\n`;
    }
  } else {
    msg += `🏨 *1ª Parcela - Reserva (10/09):* Isento (R$ 0,00)\n`;
  }

  msg += `\n`;

  // Alimentação (07/10)
  if (b.isFoodPaid) {
    msg += `🍽️ *2ª Parcela - Alimentação (Vencimento 07/10):* ✅ *100% QUITADA!*\n`;
  } else {
    msg += `🍽️ *2ª Parcela - Alimentação (Vencimento 07/10):*\n• *Valor a pagar até 07/10:* *${formatCurrency(b.pendingFood)}*\n• (Total alimentação: ${formatCurrency(b.foodExpected)} | Já pago: ${formatCurrency(b.paidForFood)})\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Saldo Devedor Total Geral:* *${formatCurrency(person.pendingAmount)}*\n`;
  msg += `(Total do pacote: ${formatCurrency(person.totalExpected)} | Total já pago: ${formatCurrency(person.paidAmount)})\n\n`;
  msg += `Qualquer dúvida ou comprovante, só me mandar por aqui! 👍\n\n`;
  msg += getPixFormattedBlock();

  return msg;
}

