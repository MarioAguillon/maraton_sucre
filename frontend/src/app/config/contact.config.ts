/** Datos de contacto oficiales del evento. Fuente única para footer, botón flotante, etc. */

export const CONTACT = {
  email: 'triatlonsucresantander@gmail.com',
  /** Atención al atleta. */
  phone: {
    display: '+57 310 219 8939',
    tel: '+573102198939',
    contactName: 'Armando Marín',
  },
  whatsappUrl: 'https://wa.me/573102198939',
  location: 'Bolívar — Sucre, Santander - Colombia',
} as const;

/** WhatsApp de Armando con mensaje predefinido para empresas interesadas en patrocinar. */
export const SPONSORSHIP_WHATSAPP_URL =
  `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
    'Hola Armando, tengo una empresa y quiero información para patrocinar la Maratón Bolívar - Sucre',
  )}`;

export const SOCIAL = {
  /** TODO: reemplazar por la URL real de la página de Facebook del evento. */
  facebookUrl: '#',
  whatsappUrl: CONTACT.whatsappUrl,
} as const;

export const DEVELOPER = {
  name: 'Mario Davis Aguillón',
  whatsappUrl:
    'https://wa.me/573188676690?text=Hola%20Mario,%20vi%20la%20p%C3%A1gina%20de%20la%20Marat%C3%B3n%20y%20quiero%20contactarte',
} as const;
