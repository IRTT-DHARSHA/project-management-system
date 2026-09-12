export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

export const isEndDateValid = (startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
};
