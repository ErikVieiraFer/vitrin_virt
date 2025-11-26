import 'package:url_launcher/url_launcher.dart';

class UrlLauncherHelper {
  static Future<bool> openWhatsApp({
    required String phone,
    required String message,
  }) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final encodedMessage = Uri.encodeComponent(message);
    final url = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMessage');

    return await _launchUrl(url);
  }

  static Future<bool> openUrl(String urlString) async {
    final url = Uri.parse(urlString);
    return await _launchUrl(url);
  }

  static Future<bool> makePhoneCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    final url = Uri.parse('tel:$cleanPhone');
    return await _launchUrl(url);
  }

  static Future<bool> sendEmail({
    required String email,
    String? subject,
    String? body,
  }) async {
    final emailUri = Uri(
      scheme: 'mailto',
      path: email,
      queryParameters: {
        if (subject != null) 'subject': subject,
        if (body != null) 'body': body,
      },
    );
    return await _launchUrl(emailUri);
  }

  static Future<bool> _launchUrl(Uri url) async {
    if (await canLaunchUrl(url)) {
      return await launchUrl(url, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
