import { ref, computed } from 'vue'
import type { ReservationFormData, ValidationErrors } from '@/types/hotel'
import { capitalizeWords, toUppercaseSafe } from '@/utils/strings'
import {
  getMinPhoneLength,
  getMaxPhoneLength,
  getCountryName,
  isValidPhoneForCountry,
  formatPhoneByCountry,
} from '@/utils/phone'
import { isDateInPast } from '@/utils'

export const useReservationForm = () => {
  const formData = ref<ReservationFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+63',
    address: '',
    idDocument: '',
    nationality: '',
    numGuest: 0,
    checkIn: '',
    checkOut: '',
    specialRequest: '',
    status: 'confirmed',
    roomNumber: '',
  })

  const errors = ref<ValidationErrors>({})

  const isFormValid = computed(() => {
    const f = formData.value
    const hasRequired = !!(
      f.firstName &&
      f.lastName &&
      f.email &&
      f.phone &&
      f.address &&
      f.idDocument &&
      f.numGuest > 0 &&
      f.checkIn &&
      f.checkOut &&
      f.roomNumber
    )
    const noErrors = Object.values(errors.value).every((e) => !e || e.trim() === '')
    return hasRequired && noErrors
  })

  const validateFirstName = () => {
    delete errors.value.firstName
    const v = formData.value.firstName?.trim() || ''
    if (!v) return ((errors.value.firstName = 'First name is required'), false)
    if (v.length < 2)
      return ((errors.value.firstName = 'First name must be at least 2 characters'), false)
    if (v.length > 50)
      return ((errors.value.firstName = 'First name must not exceed 50 characters'), false)
    if (!/^[a-zA-Z\s'-]+$/.test(v))
      return (
        (errors.value.firstName =
          'First name can only contain letters, spaces, hyphens, and apostrophes'),
        false
      )
    return true
  }

  const validateDates = () => {
    delete (errors.value as any).checkIn
    delete (errors.value as any).checkOut
    const f = formData.value
    if (f.checkIn) {
      if (isDateInPast(f.checkIn)) {
        ;(errors.value as any).checkIn = 'Check-in date cannot be in the past'
      }
    }
    if (f.checkIn && f.checkOut) {
      const checkInDate = f.checkIn
      const checkOutDate = f.checkOut
      if (checkOutDate <= checkInDate) {
        ;(errors.value as any).checkOut = 'Check-out date must be after check-in date'
      }
    }
  }

  const validateLastName = () => {
    delete errors.value.lastName
    const v = formData.value.lastName?.trim() || ''
    if (!v) return ((errors.value.lastName = 'Last name is required'), false)
    if (v.length < 2)
      return ((errors.value.lastName = 'Last name must be at least 2 characters'), false)
    if (v.length > 50)
      return ((errors.value.lastName = 'Last name must not exceed 50 characters'), false)
    if (!/^[a-zA-Z\s'-]+$/.test(v))
      return (
        (errors.value.lastName =
          'Last name can only contain letters, spaces, hyphens, and apostrophes'),
        false
      )
    return true
  }

  const validateMiddleName = () => {
    const v = formData.value.middleName?.trim()
    if (v) {
      if (v.length > 50)
        return ((errors.value.middleName = 'Middle name must not exceed 50 characters'), false)
      if (!/^[a-zA-Z\s'-]+$/.test(v))
        return (
          (errors.value.middleName =
            'Middle name can only contain letters, spaces, hyphens, and apostrophes'),
          false
        )
    }
    delete errors.value.middleName
    return true
  }

  const validateEmail = () => {
    delete errors.value.email
    const email = formData.value.email?.trim() || ''
    if (!email) return ((errors.value.email = 'Email is required'), false)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email))
      return ((errors.value.email = 'Please enter a valid email address'), false)
    if (email.length > 100)
      return ((errors.value.email = 'Email must not exceed 100 characters'), false)
    return true
  }

  const validateIdDocument = () => {
    delete errors.value.idDocument
    const v = formData.value.idDocument?.trim() || ''
    if (!v) return ((errors.value.idDocument = 'ID document is required'), false)
    if (v.length < 5)
      return ((errors.value.idDocument = 'ID document must be at least 5 characters'), false)
    if (v.length > 20)
      return ((errors.value.idDocument = 'ID document must not exceed 20 characters'), false)
    if (!/^[A-Z0-9\s-]+$/.test(v))
      return (
        (errors.value.idDocument =
          'ID document can only contain letters, numbers, spaces, and hyphens'),
        false
      )
    return true
  }

  const validateAddress = () => {
    delete errors.value.address
    const v = formData.value.address?.trim() || ''
    if (!v) return ((errors.value.address = 'Address is required'), false)
    if (v.length < 10)
      return ((errors.value.address = 'Address must be at least 10 characters'), false)
    if (v.length > 200)
      return ((errors.value.address = 'Address must not exceed 200 characters'), false)
    return true
  }

  const validateNumGuest = () => {
    delete errors.value.numGuest
    const g = formData.value.numGuest
    if (!g || g < 1) return ((errors.value.numGuest = 'Number of guests is required'), false)
    if (g > 10) return ((errors.value.numGuest = 'Maximum 10 guests allowed'), false)
    return true
  }

  const validateRoomSelection = (isRoomAvailable?: (roomNumber: string) => boolean) => {
    delete errors.value.roomNumber
    const rn = formData.value.roomNumber
    if (!rn) return ((errors.value.roomNumber = 'Room selection is required'), false)
    if (isRoomAvailable && !isRoomAvailable(rn)) {
      return (
        (errors.value.roomNumber = 'Selected room is not available for the chosen dates'),
        false
      )
    }
    return true
  }

  const validatePhone = () => {
    delete errors.value.phone
    const digits = (formData.value.phone || '').replace(/\D/g, '')
    const cc = formData.value.countryCode
    if (!digits) return ((errors.value.phone = 'Phone number is required'), false)
    const minLen = getMinPhoneLength(cc)
    const maxLen = getMaxPhoneLength(cc)
    if (digits.length < minLen)
      return (
        (errors.value.phone = `Phone number must be at least ${minLen} digits for ${getCountryName(cc)}`),
        false
      )
    if (digits.length > maxLen)
      return (
        (errors.value.phone = `Phone number must not exceed ${maxLen} digits for ${getCountryName(cc)}`),
        false
      )
    if (!isValidPhoneForCountry(digits, cc))
      return ((errors.value.phone = `Invalid phone number format for ${getCountryName(cc)}`), false)
    return true
  }

  const handleFirstNameInput = () => {
    formData.value.firstName = capitalizeWords(formData.value.firstName)
    if (errors.value.firstName) validateFirstName()
  }

  const handleLastNameInput = () => {
    formData.value.lastName = capitalizeWords(formData.value.lastName)
    if (errors.value.lastName) validateLastName()
  }

  const handleMiddleNameInput = () => {
    if (formData.value.middleName) {
      formData.value.middleName = capitalizeWords(formData.value.middleName)
    }
    validateMiddleName()
  }

  const handleEmailInput = () => {
    if (errors.value.email && formData.value.email.trim()) delete errors.value.email
  }

  const handleEmailKeydown = (event: KeyboardEvent) => {
    const email = formData.value.email.trim()
    if (
      (event.key === 'Tab' || event.key === ' ' || event.key === 'Enter') &&
      email &&
      !email.includes('@') &&
      !email.includes('.')
    ) {
      event.preventDefault()
      formData.value.email = email + '@gmail.com'
    }
    if (event.key === 'Enter') validateEmail()
  }

  const handleIdDocumentInput = () => {
    formData.value.idDocument = toUppercaseSafe(formData.value.idDocument)
    if (errors.value.idDocument) validateIdDocument()
  }

  const handleAddressInput = () => {
    formData.value.address = capitalizeWords(formData.value.address)
    if (errors.value.address) validateAddress()
  }

  const formatPhoneInput = () => {
    let digits = (formData.value.phone || '').replace(/\D/g, '')
    const cc = formData.value.countryCode
    const maxLen = getMaxPhoneLength(cc)
    if (digits.length > maxLen) digits = digits.substring(0, maxLen)
    formData.value.phone = formatPhoneByCountry(digits, cc)
    if (errors.value.phone && digits.length > 0) delete errors.value.phone
  }

  const validateForm = (): boolean => {
    errors.value = {}
    const passes = [
      validateFirstName(),
      validateLastName(),
      validateMiddleName(),
      validateEmail(),
      validatePhone(),
      validateIdDocument(),
      validateAddress(),
      validateNumGuest(),
      validateRoomSelection(),
    ]
    return passes.every(Boolean)
  }

  const resetForm = () => {
    formData.value = {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+63',
      address: '',
      idDocument: '',
      nationality: '',
      numGuest: 0,
      checkIn: '',
      checkOut: '',
      specialRequest: '',
      status: 'confirmed',
      roomNumber: '',
    }
    errors.value = {}
  }

  return {
    formData,
    errors,
    isFormValid,
    validateFirstName,
    validateLastName,
    validateMiddleName,
    validateEmail,
    validateIdDocument,
    validateAddress,
    validateNumGuest,
    validateRoomSelection,
    validatePhone,
    validateDates,
    validateForm,
    handleFirstNameInput,
    handleLastNameInput,
    handleMiddleNameInput,
    handleEmailInput,
    handleEmailKeydown,
    handleIdDocumentInput,
    handleAddressInput,
    formatPhoneInput,
    resetForm,
  }
}
