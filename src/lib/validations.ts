const IRANIAN_PHONE_REGEX = /^09\d{9}$/

export function isValidIranianPhone(phone: string): boolean {
  return IRANIAN_PHONE_REGEX.test(phone)
}
