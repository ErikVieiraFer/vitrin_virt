class FirebaseConstants {
  static const String tenantsCollection = 'tenants';
  static const String servicesCollection = 'services';
  static const String availabilityCollection = 'availability';
  static const String bookingsCollection = 'bookings';

  static const String tenantIdField = 'tenantId';
  static const String subdomainField = 'subdomain';
  static const String nameField = 'name';
  static const String logoUrlField = 'logo_url';
  static const String whatsappField = 'whatsapp';
  static const String themeSettingsField = 'theme_settings';
  static const String primaryColorField = 'primary_color';
  static const String secondaryColorField = 'secondary_color';
  static const String fontFamilyField = 'font_family';

  static const String serviceIdField = 'service_id';
  static const String descriptionField = 'description';
  static const String durationMinutesField = 'duration_minutes';
  static const String priceField = 'price';
  static const String imageUrlField = 'image_url';
  static const String isActiveField = 'active';
  static const String createdAtField = 'createdAt';

  static const String customerNameField = 'customerName';
  static const String customerPhoneField = 'customerPhone';
  // Devem casar com booking_model.toJson (schema canônico camelCase, ver /SCHEMA.md).
  // Se divergirem do writer, a checagem de slot não acha o agendamento e permite overbooking.
  static const String bookingDateField = 'bookingDate';
  static const String bookingTimeField = 'bookingTime';
  static const String statusField = 'status';

  static const String dayOfWeekField = 'day_of_week';
  static const String startTimeField = 'start_time';
  static const String endTimeField = 'end_time';
  static const String slotDurationMinutesField = 'slot_duration_minutes';

  static const String statusPending = 'pending';
  static const String statusConfirmed = 'confirmed';
  static const String statusCancelled = 'cancelled';
}
