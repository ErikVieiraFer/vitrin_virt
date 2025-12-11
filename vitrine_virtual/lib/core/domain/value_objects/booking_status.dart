/// Status possíveis de um agendamento.
///
/// Enum tipado com métodos auxiliares para lógica de negócio.
enum BookingStatus {
  /// Agendamento criado, aguardando confirmação.
  pending('pending', 'Pendente'),

  /// Agendamento confirmado pelo estabelecimento.
  confirmed('confirmed', 'Confirmado'),

  /// Agendamento cancelado.
  cancelled('cancelled', 'Cancelado'),

  /// Agendamento concluído (serviço realizado).
  completed('completed', 'Concluído'),

  /// Cliente não compareceu.
  noShow('no_show', 'Não compareceu');

  /// Valor armazenado no banco de dados.
  final String value;

  /// Nome para exibição em português.
  final String displayName;

  const BookingStatus(this.value, this.displayName);

  /// Cria BookingStatus a partir de string do banco.
  static BookingStatus fromString(String value) {
    return BookingStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => BookingStatus.pending,
    );
  }

  /// Verifica se o agendamento está ativo (não cancelado/concluído).
  bool get isActive => this == pending || this == confirmed;

  /// Verifica se o agendamento está finalizado.
  bool get isFinalized =>
      this == cancelled || this == completed || this == noShow;

  /// Verifica se pode ser cancelado.
  bool get canBeCancelled => this == pending || this == confirmed;

  /// Verifica se pode ser confirmado.
  bool get canBeConfirmed => this == pending;

  /// Verifica se pode ser marcado como concluído.
  bool get canBeCompleted => this == confirmed;

  /// Verifica se pode ser marcado como no-show.
  bool get canBeMarkedAsNoShow => this == confirmed;

  /// Retorna os próximos status possíveis.
  List<BookingStatus> get possibleNextStatuses {
    switch (this) {
      case pending:
        return [confirmed, cancelled];
      case confirmed:
        return [completed, cancelled, noShow];
      case cancelled:
      case completed:
      case noShow:
        return [];
    }
  }

  @override
  String toString() => displayName;
}
