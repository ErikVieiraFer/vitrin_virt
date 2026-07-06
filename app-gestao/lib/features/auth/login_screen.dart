import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();
  bool _carregando = false;
  String? _erro;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _senhaCtrl.dispose();
    super.dispose();
  }

  Future<void> _entrar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _carregando = true;
      _erro = null;
    });
    try {
      await ref.read(firebaseAuthProvider).signInWithEmailAndPassword(
            email: _emailCtrl.text.trim(),
            password: _senhaCtrl.text,
          );
      // Redirecionamento é feito pelo go_router observando o authState.
    } on FirebaseAuthException catch (e) {
      setState(() {
        _erro = switch (e.code) {
          'invalid-credential' ||
          'wrong-password' ||
          'user-not-found' =>
            'E-mail ou senha incorretos',
          'too-many-requests' =>
            'Muitas tentativas. Aguarde alguns minutos.',
          _ => 'Erro ao entrar (${e.code})',
        };
      });
    } finally {
      if (mounted) setState(() => _carregando = false);
    }
  }

  Future<void> _recuperarSenha() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) {
      setState(() => _erro = 'Informe seu e-mail para recuperar a senha');
      return;
    }
    await ref.read(firebaseAuthProvider).sendPasswordResetEmail(email: email);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('E-mail de recuperação enviado')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: AppSpacing.paddingLg,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Icon(Icons.storefront,
                      size: 64, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(height: AppSpacing.md),
                  Text('Vitrine Virtual',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineMedium),
                  Text('Gestão do seu negócio',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: AppSpacing.xl),
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(labelText: 'E-mail'),
                    validator: (v) =>
                        (v == null || !v.contains('@')) ? 'E-mail inválido' : null,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: _senhaCtrl,
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    decoration: const InputDecoration(labelText: 'Senha'),
                    validator: (v) =>
                        (v == null || v.length < 6) ? 'Mínimo 6 caracteres' : null,
                    onFieldSubmitted: (_) => _entrar(),
                  ),
                  if (_erro != null) ...[
                    const SizedBox(height: AppSpacing.md),
                    Text(_erro!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error)),
                  ],
                  const SizedBox(height: AppSpacing.lg),
                  FilledButton(
                    onPressed: _carregando ? null : _entrar,
                    child: _carregando
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text('Entrar'),
                  ),
                  TextButton(
                    onPressed: _recuperarSenha,
                    child: const Text('Esqueci minha senha'),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Ainda não tem conta? Assine pelo nosso site.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
