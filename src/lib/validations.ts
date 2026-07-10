const IRANIAN_PHONE_REGEX = /^09\d{9}$/;

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toEnglishDigits(str: string): string {
  return str.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
}

export function isValidIranianPhone(phone: string): boolean {
  return IRANIAN_PHONE_REGEX.test(toEnglishDigits(phone));
}

export function safeRedirect(value: string, fallback = '/dashboard'): string {
  if (value.startsWith('/') && !value.startsWith('//')) return value
  return fallback
}
