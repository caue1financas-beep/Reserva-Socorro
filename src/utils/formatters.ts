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

export const OFFICIAL_RESERVE_TARGET = 2500;
export const ADVANCE_RESERVE_EXPENSE = 500;
export const SETTLEMENT_RESERVE_EXPENSE = 2000;
export const TOTAL_RESERVE_EXPENSES = 2500;

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
  const isVacant = (name: string) => name.toLowerCase().includes('vaga') || name.toLowerCase().includes('disponível');
  const activeItems = items.filter((p) => !isVacant(p.name));

  const totalEsperadoReserva = OFFICIAL_RESERVE_TARGET; // R$ 2.500,00 oficial
  const totalPagoReserva = activeItems.reduce((acc, curr) => acc + getPersonDeadlineBreakdown(curr).paidForReserve, 0);
  const totalPendenteReserva = Math.max(0, totalEsperadoReserva - totalPagoReserva);

  const totalEsperadoAlimentacao = activeItems.reduce((acc, curr) => acc + curr.expectedFood, 0);
  const totalPagoAlimentacao = activeItems.reduce((acc, curr) => acc + getPersonDeadlineBreakdown(curr).paidForFood, 0);
  const totalPendenteAlimentacao = Math.max(0, totalEsperadoAlimentacao - totalPagoAlimentacao);

  const totalGeral = totalEsperadoReserva + totalEsperadoAlimentacao;
  const totalPagoGeral = activeItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalGastosReserva = TOTAL_RESERVE_EXPENSES; // R$ 2.500,00 (Adiantamento R$ 500 + Quitação R$ 2.000)
  const saldoEmConta = totalPagoGeral - totalGastosReserva;

  if (mode === 'reserve_focus') {
    let msg = `📅 *STATUS DA RESERVA: 100% QUITADA COM O IMÓVEL*\n\n`;
    msg += `🏨 *Custo Total da Reserva:* ${formatCurrency(totalEsperadoReserva)}\n`;
    msg += `✅ *Total Pago ao Proprietário:* ${formatCurrency(totalGastosReserva)} (Quitado!)\n`;
    msg += `👥 *Arrecadado dos participantes:* ${formatCurrency(totalPagoGeral)}\n\n`;
    msg += `💳 *FLUXO DE CAIXA ATUAL:*\n`;
    msg += `• Adiantamento pago reserva: -${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
    msg += `• Quitação reserva paga: -${formatCurrency(SETTLEMENT_RESERVE_EXPENSE)}\n`;
    msg += `• Total de gastos da reserva: -${formatCurrency(totalGastosReserva)}\n`;
    msg += `• Valores arrecadados: ${formatCurrency(totalPagoGeral)}\n`;
    msg += `• 👉 *SALDO ATUAL EM CONTA:* *${formatCurrency(saldoEmConta)}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*QUANTO FALTA CADA UM PAGAR DA RESERVA:*\n\n`;

    const pendingReservePeople = activeItems
      .map((p) => ({ person: p, breakdown: getPersonDeadlineBreakdown(p) }))
      .filter((item) => item.breakdown.pendingReserve > 0)
      .sort((a, b) => b.breakdown.pendingReserve - a.breakdown.pendingReserve);

    pendingReservePeople.forEach((item, idx) => {
      const p = item.person;
      const b = item.breakdown;
      msg += `${idx + 1}. 🔴 *${p.name}*: Falta *${formatCurrency(b.pendingReserve)}* (Pago: ${formatCurrency(b.paidForReserve)})\n`;
    });

    const paidReservePeople = activeItems
      .filter((p) => getPersonDeadlineBreakdown(p).isReservePaid);
    if (paidReservePeople.length > 0) {
      msg += `\n🟢 *RESERVA QUITADA (${paidReservePeople.length} pessoas):*\n`;
      paidReservePeople.forEach((p) => {
        msg += `✅ *${p.name}* (OK)\n`;
      });
    }

    msg += `\n_Lembrando: A 2ª parcela (Alimentação) vence em 07/10._\n\n`;
    msg += getPixFormattedBlock();
    return msg;
  }

  // Full / All deadlines
  let message = `📋 *RESUMO FINANCEIRO DA CHÁCARA*\n\n`;
  message += `📌 *1ª ETAPA: RESERVA (R$ 2.500,00 - QUITADA COM O IMÓVEL!)*\n`;
  message += `• Valor da Reserva: ${formatCurrency(totalEsperadoReserva)}\n`;
  message += `• Status: ✅ 100% Paga ao proprietário (R$ 500 adiantamento + R$ 2.000 quitação)\n`;
  message += `• Já Pago pelos participantes: ${formatCurrency(totalPagoReserva)}\n`;
  if (totalPendenteReserva > 0) {
    message += `• *Pendente entre participantes: ${formatCurrency(totalPendenteReserva)}*\n\n`;
  } else {
    message += `• *Pendente da Reserva: R$ 0,00 (100% Coberta)*\n\n`;
  }

  message += `📌 *2ª ETAPA: ALIMENTAÇÃO (Vencimento: 07/10)*\n`;
  message += `• Total Previsto Alimentação: ${formatCurrency(totalEsperadoAlimentacao)}\n`;
  message += `• Já Adiantado Alimentação: ${formatCurrency(totalPagoAlimentacao)}\n`;
  message += `• *Falta Arrecadar (até 07/10): ${formatCurrency(totalPendenteAlimentacao)}*\n\n`;

  message += `💳 *FLUXO DE CAIXA & SALDO EM CONTA:*\n`;
  message += `• Adiantamento Pago reserva: -${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
  message += `• Quitação reserva: -${formatCurrency(SETTLEMENT_RESERVE_EXPENSE)}\n`;
  message += `• Total de Gastos: -${formatCurrency(totalGastosReserva)}\n`;
  message += `• Valores Arrecadados: ${formatCurrency(totalPagoGeral)}\n`;
  message += `• 👉 *SALDO ATUAL EM CONTA: ${formatCurrency(saldoEmConta)}*\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔴 *DETALHAMENTO POR PESSOA:*\n\n`;

  const sortedList = [...activeItems].sort((a, b) => b.pendingAmount - a.pendingAmount);

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

export function generateDirectStatementList(items: PersonDebt[]): string {
  const isVacant = (name: string) => name.toLowerCase().includes('vaga') || name.toLowerCase().includes('disponível');
  const validItems = items.filter((p) => !isVacant(p.name));
  const totalArrecadado = validItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPendente = validItems.reduce((acc, curr) => acc + curr.pendingAmount, 0);
  const totalGastos = TOTAL_RESERVE_EXPENSES; // R$ 2.500,00
  const saldoEmConta = totalArrecadado - totalGastos;

  let msg = `🔴 *PRESTAÇÃO DE CONTAS & VALORES PENDENTES*\n\n`;
  msg += `🏨 *1. RESERVA DA CHÁCARA (100% QUITADA COM O IMÓVEL!)*\n`;
  msg += `• Adiantamento pago reserva: -${formatCurrency(ADVANCE_RESERVE_EXPENSE)}\n`;
  msg += `• Quitação da reserva: -${formatCurrency(SETTLEMENT_RESERVE_EXPENSE)}\n`;
  msg += `• Total de gastos da reserva: -${formatCurrency(totalGastos)} (Quitado com o proprietário!)\n\n`;

  msg += `💵 *2. FLUXO DE CAIXA ATUAL:*\n`;
  msg += `• Total Arrecadado (Pix recebido): ${formatCurrency(totalArrecadado)}\n`;
  msg += `• (-) Gastos da Reserva pagos: -${formatCurrency(totalGastos)}\n`;
  msg += `• 👉 *SALDO ATUAL EM CONTA:* *${formatCurrency(saldoEmConta)}* (já reservado para alimentação)\n`;
  msg += `• Total geral a receber: ${formatCurrency(totalPendente)}\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👥 *3. PARTICIPANTES COM VALORES A PAGAR:*\n\n`;

  const sorted = [...validItems].sort((a, b) => b.pendingAmount - a.pendingAmount);
  const confirmedPending = sorted.filter((p) => p.pendingAmount > 0);

  confirmedPending.forEach((p, idx) => {
    const b = getPersonDeadlineBreakdown(p);
    let detalhe = '';
    if (b.pendingReserve > 0) {
      detalhe = `⚠️ Falta Reserva: ${formatCurrency(b.pendingReserve)} | Falta Alim: ${formatCurrency(b.pendingFood)}`;
    } else {
      detalhe = `Reserva OK ✅ | Falta Alim (07/10): ${formatCurrency(b.pendingFood)}`;
    }
    msg += `${idx + 1}. 🔴 *${p.name}*:\n   • Já Pagou: *${formatCurrency(p.paidAmount)}*\n   • Falta Pagar: *${formatCurrency(p.pendingAmount)}* (${detalhe})\n`;
  });

  msg += `\n` + getPixFormattedBlock();
  return msg;
}

export function generatePaidOnlySummary(items: PersonDebt[]): string {
  const isVacant = (name: string) => name.toLowerCase().includes('vaga') || name.toLowerCase().includes('disponível');
  const fullyPaid = items
    .filter((p) => !isVacant(p.name) && p.pendingAmount === 0)
    .sort((a, b) => b.paidAmount - a.paidAmount);

  const totalPaidByGroup = fullyPaid.reduce((acc, curr) => acc + curr.paidAmount, 0);

  let msg = `🟢 *PARTICIPANTES 100% QUITADOS (CHÁCARA & ALIMENTAÇÃO)*\n\n`;
  msg += `Agradecemos a todos que já concluíram o pagamento total da viagem! 🎉👏\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⭐ *LISTA DE QUEM JÁ QUITOU TUDO:*\n\n`;

  fullyPaid.forEach((p, idx) => {
    msg += `${idx + 1}. ✅ *${p.name}* — Já pagou *${formatCurrency(p.paidAmount)}* (100% Quitado)\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *Resumo dos Quitados:*\n`;
  msg += `• Total de pessoas quitadas: *${fullyPaid.length} participantes*\n`;
  msg += `• Total arrecadado deste grupo: *${formatCurrency(totalPaidByGroup)}*\n`;
  msg += `• Status: 100% em dia ✅ Sem pendências!\n`;

  return msg;
}

