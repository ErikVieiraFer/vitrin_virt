import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object?> get props => [message];
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Erro de conexão com a internet']);
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Erro no servidor']);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Erro ao acessar dados locais']);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'Dados não encontrados']);
}

class ValidationFailure extends Failure {
  const ValidationFailure([super.message = 'Dados inválidos']);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'Não autorizado']);
}

class ConflictFailure extends Failure {
  const ConflictFailure([super.message = 'Conflito ao processar a solicitação']);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Erro desconhecido']);
}
