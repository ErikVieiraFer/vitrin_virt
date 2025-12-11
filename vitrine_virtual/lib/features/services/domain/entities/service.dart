import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/money.dart';

/// Entity para Service (serviço oferecido).
///
/// Representa um serviço que o estabelecimento oferece.
/// Entity pura sem dependências de Firebase ou JSON.
/// Imutável e com lógica de negócio.
class Service extends Equatable {
  final String id;
  final String tenantId;
  final String name;
  final String description;
  final int durationMinutes;
  final Money price;
  final String imageUrl;
  final bool isActive;
  final DateTime createdAt;

  const Service({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.description,
    required this.durationMinutes,
    required this.price,
    required this.imageUrl,
    required this.isActive,
    required this.createdAt,
  });

  /// Verifica se o serviço está configurado corretamente.
  bool get isValid {
    return id.isNotEmpty &&
        tenantId.isNotEmpty &&
        name.isNotEmpty &&
        durationMinutes > 0;
  }

  /// Verifica se tem imagem configurada.
  bool get hasImage => imageUrl.isNotEmpty;

  /// Verifica se tem descrição.
  bool get hasDescription => description.isNotEmpty;

  /// Verifica se é gratuito.
  bool get isFree => price.isFree;

  /// Verifica se está disponível para agendamento.
  bool get isAvailable => isActive && isValid;

  /// Duração em horas (arredondada).
  double get durationHours => durationMinutes / 60;

  /// Duração formatada (ex: "30 min", "1h", "1h 30min").
  String get formattedDuration {
    if (durationMinutes < 60) {
      return '$durationMinutes min';
    }
    final hours = durationMinutes ~/ 60;
    final minutes = durationMinutes % 60;
    if (minutes == 0) {
      return '${hours}h';
    }
    return '${hours}h ${minutes}min';
  }

  /// Preço formatado em Real brasileiro.
  String get formattedPrice => price.formatted;

  /// Calcula o preço por hora.
  Money get pricePerHour {
    if (durationMinutes == 0) return Money.zero();
    return price * (60 / durationMinutes);
  }

  /// Verifica se cabe em um slot de tempo.
  bool fitsInSlot(int slotDurationMinutes) {
    return durationMinutes <= slotDurationMinutes;
  }

  /// Cria cópia com modificações.
  Service copyWith({
    String? id,
    String? tenantId,
    String? name,
    String? description,
    int? durationMinutes,
    Money? price,
    String? imageUrl,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return Service(
      id: id ?? this.id,
      tenantId: tenantId ?? this.tenantId,
      name: name ?? this.name,
      description: description ?? this.description,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        tenantId,
        name,
        description,
        durationMinutes,
        price,
        imageUrl,
        isActive,
        createdAt,
      ];
}
