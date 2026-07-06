import * as admin from 'firebase-admin';

admin.initializeApp();

export {
  criarAgendamento,
  criarAgendamentoManual,
  cancelarAgendamento,
  reagendarAgendamento,
  listarSlots,
} from './agendamentos';
export { criarConta, criarProfissional, reativarProfissional } from './signup';
export { aoMudarAgendamento } from './notificacoes';
export { atualizarStatusAgendamento } from './gestao';
export { mpWebhook } from './mercadopago';
