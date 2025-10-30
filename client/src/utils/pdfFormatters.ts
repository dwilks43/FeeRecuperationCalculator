// PDF-specific formatters for sales-grade presentation
export const fmtMoney = (n: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(n);
};

export const fmtPct = (n: number, digits = 2): string => {
  return `${(Math.round(n * 100) / 100).toFixed(digits)}%`;
};

export const safeJoin = (...parts: (string | undefined | null)[]): string => {
  return parts.filter(Boolean).join(' ');
};

export const titleCase = (s: string): string => {
  return s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
};

export const humanizeProgram = (programType: string | undefined): string => {
  if (!programType) return 'Fee Recovery Program';
  
  const mapping: Record<string, string> = {
    'DUAL_PRICING': 'Dual Pricing',
    'CASH_DISCOUNTING': 'Cash Discounting',
    'SUPPLEMENTAL_FEE': 'Supplemental Fee',
    'Dual_Pricing': 'Dual Pricing',
    'Cash_Discounting': 'Cash Discounting',
    'Supplemental_Fee': 'Supplemental Fee'
  };
  
  return mapping[programType] || programType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const guardEmpty = (value: any, fallback = ''): string => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value);
};

export const formatContact = (name?: string, email?: string, phone?: string): {
  hasName: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  name: string;
  email: string;
  phone: string;
  emailLink: string;
} => {
  return {
    hasName: !!name && name.trim() !== '',
    hasEmail: !!email && email.trim() !== '',
    hasPhone: !!phone && phone.trim() !== '',
    name: guardEmpty(name, 'Your Representative'),
    email: guardEmpty(email),
    phone: guardEmpty(phone),
    emailLink: email && email.trim() ? `mailto:${email.trim()}` : '#'
  };
};