// Phone validation (Indian format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Pincode validation (Indian format)
export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
};

// Address form validation
export const validateAddressForm = (data: {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Phone must be 10 digits';
  }
  if (!data.addressLine1?.trim()) {
    errors.addressLine1 = 'Address line 1 is required';
  }
  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }
  if (!data.state?.trim()) {
    errors.state = 'State is required';
  }
  if (!data.pincode?.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!validatePincode(data.pincode)) {
    errors.pincode = 'Pincode must be 6 digits';
  }
  if (!data.country?.trim()) {
    errors.country = 'Country is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const formatPincode = (pincode: string): string => {
  return pincode.replace(/\D/g, '');
};

// Safely parse dates from various formats (Firestore Timestamp, ISO string, Date object)
export const parseSafeDate = (value: any): Date | null => {
  if (!value) return null;

  // Handle Firestore Timestamp objects
  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }

  // Handle Firestore Timestamp with seconds property
  if (value && typeof value === 'object' && typeof value.seconds === 'number') {
    try {
      return new Date(value.seconds * 1000);
    } catch {
      return null;
    }
  }

  // Handle Date objects
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Handle ISO strings and other date strings
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};
