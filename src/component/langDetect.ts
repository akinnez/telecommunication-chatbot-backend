import { detect } from 'langdetect';

export function detectLanguage(text: string): string {
  const lowered = text.toLowerCase();

  // Custom check for common Pidgin phrases
  const isPidgin = /(abeg|dey|na|wetin|wahala|make we|una|no vex)/i.test(
    lowered,
  );
  if (isPidgin) {
    return 'Pidgin';
  }
  // Fallback to langdetect
  const lang = detect(text);

  switch (lang) {
    case 'en':
      return 'English';
    case 'yo':
      return 'Yoruba';
    case 'ig':
    case 'ibo':
      return 'Igbo';
    case 'ha':
      return 'Hausa';
    default:
      return 'English'; // safe fallback
  }
}
