import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/utils/validators.dart';

class CustomerForm extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final GlobalKey<FormState> formKey;

  const CustomerForm({
    super.key,
    required this.nameController,
    required this.phoneController,
    required this.formKey,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Seus dados',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Nome completo',
                  hintText: 'Digite seu nome',
                  prefixIcon: Icon(Icons.person),
                ),
                textCapitalization: TextCapitalization.words,
                validator: Validators.validateName,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'Telefone',
                  hintText: '+55 11 99999-9999',
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  _PhoneInputFormatter(),
                ],
                validator: Validators.validatePhone,
                textInputAction: TextInputAction.done,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PhoneInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Extrai apenas os dígitos
    String digits = newValue.text.replaceAll(RegExp(r'\D'), '');

    // Se estiver vazio, retorna vazio
    if (digits.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    // Garante que começa com 55 (código do Brasil)
    if (!digits.startsWith('55')) {
      digits = '55$digits';
    }

    // Limita a 13 dígitos (55 + DDD 2 dígitos + telefone 9 dígitos)
    if (digits.length > 13) {
      digits = digits.substring(0, 13);
    }

    // Formata: +55 XX XXXXX-XXXX
    final buffer = StringBuffer();

    for (int i = 0; i < digits.length; i++) {
      if (i == 0) buffer.write('+');
      if (i == 2) buffer.write(' '); // Após código do país
      if (i == 4) buffer.write(' '); // Após DDD
      if (i == 9) buffer.write('-'); // Antes dos últimos 4 dígitos
      buffer.write(digits[i]);
    }

    final formatted = buffer.toString();

    // Cursor sempre no final
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
