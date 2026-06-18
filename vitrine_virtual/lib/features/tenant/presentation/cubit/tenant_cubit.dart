import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/domain/value_objects/hex_color.dart';
import '../../../../core/domain/value_objects/phone.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/tenant.dart';
import '../../domain/entities/theme_settings.dart';
import '../../domain/entities/vitrine_section.dart';
import '../../domain/usecases/get_tenant_by_subdomain.dart';
import 'tenant_state.dart';

/// Cubit responsável por gerenciar o estado do Tenant.
///
/// Carrega as informações do tenant baseado no subdomínio
/// e mantém o estado disponível para toda a aplicação.
class TenantCubit extends Cubit<TenantState> {
  final GetTenantBySubdomain getTenantBySubdomain;

  TenantCubit({required this.getTenantBySubdomain})
      : super(const TenantInitial());

  /// Carrega o tenant pelo subdomínio.
  Future<void> loadTenant(String subdomain) async {
    AppLogger.state('TenantCubit', 'Loading', extra: 'subdomain: $subdomain');

    emit(const TenantLoading());

    final result = await getTenantBySubdomain(subdomain);

    result.fold(
      (failure) {
        AppLogger.error(
          'Erro ao carregar tenant',
          tag: 'TenantCubit',
          error: failure.message,
        );
        emit(TenantError(failure.message));
      },
      (tenant) {
        AppLogger.state('TenantCubit', 'Loaded', extra: 'Nome: ${tenant.name}');
        emit(TenantLoaded(tenant));
      },
    );
  }

  /// Aplica um rascunho recebido do editor (modo preview ao vivo).
  ///
  /// Recebe um JSON em String no formato
  /// `{ source: 'vitrine-editor', theme: {...}, sections: [...] }`,
  /// e re-emite o tenant atual com o tema e as seções do rascunho — sem salvar.
  void applyPreview(String rawJson) {
    try {
      final decoded = jsonDecode(rawJson);
      if (decoded is! Map) return;
      if (decoded['source'] != 'vitrine-editor') return;

      final themeJson = decoded['theme'];
      final ThemeSettings? draftTheme = themeJson is Map
          ? ThemeSettings(
              primaryColor: HexColor(
                (themeJson['primaryColor'] ?? themeJson['primary_color'] ?? '#3b82f6')
                    .toString(),
              ),
              secondaryColor: HexColor(
                (themeJson['secondaryColor'] ?? themeJson['secondary_color'] ?? '#8b5cf6')
                    .toString(),
              ),
              fontFamily:
                  (themeJson['fontFamily'] ?? themeJson['font_family'])?.toString(),
            )
          : null;

      final sectionsRaw = decoded['sections'];
      final sections = sectionsRaw is List
          ? sectionsRaw
              .whereType<Map>()
              .map((e) => VitrineSection.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : <VitrineSection>[];

      final logoUrl = themeJson is Map
          ? (themeJson['logoUrl'] ?? themeJson['logo_url'])?.toString()
          : null;

      final current = state is TenantLoaded ? (state as TenantLoaded).tenant : null;

      if (current != null) {
        emit(TenantLoaded(current.copyWith(
          themeSettings: draftTheme ?? current.themeSettings,
          sections: sections,
          logoUrl: logoUrl ?? current.logoUrl,
        )));
      } else {
        emit(TenantLoaded(Tenant(
          id: 'preview',
          subdomain: 'preview',
          name: 'Pré-visualização',
          logoUrl: logoUrl ?? '',
          whatsapp: Phone(''),
          themeSettings: draftTheme ??
              ThemeSettings(
                primaryColor: HexColor('#3b82f6'),
                secondaryColor: HexColor('#8b5cf6'),
                fontFamily: null,
              ),
          sections: sections,
        )));
      }
    } catch (e) {
      AppLogger.error('Erro ao aplicar preview', tag: 'TenantCubit', error: e);
    }
  }

  /// Reseta o estado para inicial.
  void reset() {
    emit(const TenantInitial());
  }
}
