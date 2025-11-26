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
    final text = newValue.text;

    if (text.isEmpty) {
      return newValue;
    }

    final buffer = StringBuffer();
    var offset = newValue.selection.baseOffset;

    if (text.length >= 2 && !text.startsWith('55')) {
      buffer.write('55');
      offset += 2;
    }

    final digits = text.replaceAll(RegExp(r'\D'), '');

    if (digits.length <= 2) {
      buffer.write('+$digits');
    } else if (digits.length <= 4) {
      buffer.write('+${digits.substring(0, 2)} ${digits.substring(2)}');
    } else if (digits.length <= 9) {
      buffer.write(
          '+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4)}');
    } else {
      buffer.write(
          '+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 9)}-${digits.substring(9, digits.length > 13 ? 13 : digits.length)}');
    }

    final formatted = buffer.toString();

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(
        offset: offset > formatted.length ? formatted.length : offset,
      ),
    );
  }
}
