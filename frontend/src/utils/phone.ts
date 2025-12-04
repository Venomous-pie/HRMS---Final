export function getMaxPhoneLength(countryCode: string): number {
  const lengths: Record<string, number> = {
    '+1': 10,
    '+63': 10,
    '+44': 11,
    '+86': 11,
    '+81': 11,
    '+82': 11,
    '+65': 8,
    '+60': 10,
    '+66': 9,
    '+84': 10,
    '+62': 12,
    '+91': 10,
    '+61': 9,
    '+64': 9,
  }
  return lengths[countryCode] ?? 10
}

export function getMinPhoneLength(countryCode: string): number {
  const lengths: Record<string, number> = {
    '+1': 10,
    '+63': 10,
    '+44': 10,
    '+86': 11,
    '+81': 10,
    '+82': 10,
    '+65': 8,
    '+60': 9,
    '+66': 8,
    '+84': 9,
    '+62': 10,
    '+91': 10,
    '+61': 9,
    '+64': 8,
  }
  return lengths[countryCode] ?? 8
}

export function getCountryName(countryCode: string): string {
  const names: Record<string, string> = {
    '+1': 'US/Canada',
    '+63': 'Philippines',
    '+44': 'UK',
    '+86': 'China',
    '+81': 'Japan',
    '+82': 'South Korea',
    '+65': 'Singapore',
    '+60': 'Malaysia',
    '+66': 'Thailand',
    '+84': 'Vietnam',
    '+62': 'Indonesia',
    '+91': 'India',
    '+61': 'Australia',
    '+64': 'New Zealand',
  }
  return names[countryCode] ?? 'selected country'
}

export function formatPhoneByCountry(phone: string, countryCode: string): string {
  if (!phone) return ''

  switch (countryCode) {
    case '+1':
      if (phone.length >= 6) {
        return `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`
      } else if (phone.length >= 3) {
        return `(${phone.substring(0, 3)}) ${phone.substring(3)}`
      }
      return phone

    case '+63':
      if (phone.length >= 7) {
        return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`
      } else if (phone.length >= 4) {
        return `${phone.substring(0, 4)} ${phone.substring(4)}`
      }
      return phone

    case '+44':
      if (phone.length >= 6) {
        return `${phone.substring(0, 5)} ${phone.substring(5)}`
      }
      return phone

    case '+65':
      if (phone.length >= 4) {
        return `${phone.substring(0, 4)} ${phone.substring(4)}`
      }
      return phone

    default:
      if (phone.length >= 6) {
        return `${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}`
      } else if (phone.length >= 3) {
        return `${phone.substring(0, 3)} ${phone.substring(3)}`
      }
      return phone
  }
}

export function isValidPhoneForCountry(phone: string, countryCode: string): boolean {
  switch (countryCode) {
    case '+1':
      return !/^[01]/.test(phone)

    case '+63':
      return /^(9|2|3|4|5|6|7|8)/.test(phone)

    case '+44':
      return /^(1|2|3|7|8)/.test(phone)

    case '+65':
      return /^[689]/.test(phone)

    case '+86':
      return /^1/.test(phone)

    case '+81':
      return /^[1-9]/.test(phone)

    case '+82':
      return /^1/.test(phone)

    case '+91':
      return /^[6-9]/.test(phone)

    default:
      return true
  }
}
