import * as admin from 'firebase-admin';

admin.initializeApp();

export {
  criarAgendamento,
  criarAgendamentoManual,
  obterAgendamentoPorToken,
  cancelarAgendamento,
  reagendarAgendamento,
  listarSlots,
} from './agendamentos';
export { criarConta, criarProfissional, reativarProfissional } from './signup';
export { aoMudarAgendamento } from './notificacoes';
export { atualizarStatusAgendamento } from './gestao';
export {
  criarAssinatura,
  cancelarAssinatura,
  mpWebhook,
  verificarAssinaturas,
} from './mercadopago';
