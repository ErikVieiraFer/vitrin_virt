import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/utils/formatters/phone_input_formatter.dart';

/// Campo de texto customizado reutilizável.
///
/// Encapsula configurações comuns de [TextFormField] com
/// estilos e comportamentos padronizados.
class CustomTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final int? maxLines;
  final int? maxLength;
  final List<TextInputFormatter>? inputFormatters;
  final FocusNode? focusNode;
  final String? initialValue;
  final AutovalidateMode? autovalidateMode;

  const CustomTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
    this.inputFormatters,
    this.focusNode,
    this.initialValue,
    this.autovalidateMode,
  });

  /// Campo de texto para nome.
  factory CustomTextField.name({
    Key? key,
    TextEditingController? controller,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputAction? textInputAction,
    FocusNode? focusNode,
  }) {
    return CustomTextField(
      key: key,
      controller: controller,
      label: 'Nome completo',
      hint: 'Digite seu nome',
      prefixIcon: Icons.person,
      validator: validator,
      onChanged: onChanged,
      textCapitalization: TextCapitalization.words,
      textInputAction: textInputAction ?? TextInputAction.next,
      focusNode: focusNode,
    );
  }

  /// Campo de texto para telefone brasileiro.
  factory CustomTextField.phone({
    Key? key,
    TextEditingController? controller,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputAction? textInputAction,
    FocusNode? focusNode,
  }) {
    return CustomTextField(
      key: key,
      controller: controller,
      label: 'Telefone',
      hint: '+55 11 99999-9999',
      prefixIcon: Icons.phone,
      validator: validator,
      onChanged: onChanged,
      keyboardType: TextInputType.phone,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        BrazilianPhoneFormatter(),
      ],
      textInputAction: textInputAction ?? TextInputAction.done,
      focusNode: focusNode,
    );
  }

  /// Campo de texto para email.
  factory CustomTextField.email({
    Key? key,
    TextEditingController? controller,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputAction? textInputAction,
    FocusNode? focusNode,
  }) {
    return CustomTextField(
      key: key,
      controller: controller,
      label: 'E-mail',
      hint: 'seu@email.com',
      prefixIcon: Icons.email,
      validator: validator,
      onChanged: onChanged,
      keyboardType: TextInputType.emailAddress,
      textInputAction: textInputAction ?? TextInputAction.next,
      focusNode: focusNode,
    );
  }

  /// Campo de texto para senha.
  factory CustomTextField.password({
    Key? key,
    TextEditingController? controller,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputAction? textInputAction,
    FocusNode? focusNode,
    bool showPassword = false,
    VoidCallback? onToggleVisibility,
  }) {
    return CustomTextField(
      key: key,
      controller: controller,
      label: 'Senha',
      hint: 'Digite sua senha',
      prefixIcon: Icons.lock,
      suffixIcon: IconButton(
        icon: Icon(showPassword ? Icons.visibility_off : Icons.visibility),
        onPressed: onToggleVisibility,
      ),
      validator: validator,
      onChanged: onChanged,
      obscureText: !showPassword,
      textInputAction: textInputAction ?? TextInputAction.done,
      focusNode: focusNode,
    );
  }

  /// Campo de texto multilinhas.
  factory CustomTextField.multiline({
    Key? key,
    TextEditingController? controller,
    String? label,
    String? hint,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    int maxLines = 4,
    int? maxLength,
    FocusNode? focusNode,
  }) {
    return CustomTextField(
      key: key,
      controller: controller,
      label: label,
      hint: hint,
      validator: validator,
      onChanged: onChanged,
      maxLines: maxLines,
      maxLength: maxLength,
      textInputAction: TextInputAction.newline,
      focusNode: focusNode,
    );
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      initialValue: initialValue,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
        suffixIcon: suffixIcon,
      ),
      validator: validator,
      onChanged: onChanged,
      onFieldSubmitted: onSubmitted,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      textCapitalization: textCapitalization,
      obscureText: obscureText,
      enabled: enabled,
      readOnly: readOnly,
      maxLines: maxLines,
      maxLength: maxLength,
      inputFormatters: inputFormatters,
      focusNode: focusNode,
      autovalidateMode: autovalidateMode,
    );
  }
}
