export interface CompanyBillingConfig {
  id: 'gop';
  name: string;
  shortName: string;
  legalName: string;
  tagline: string;
  registrationNumber: string;
  addressLines: string[];
  email: string;
  phone: string;
  logoUrl: string;
  brandColorHex: string;
  brandColorRgb: [number, number, number];
  invoicePrefix: string;
  currency: string;
}

export const GOP_BILLING_CONFIG: CompanyBillingConfig = {
  id: 'gop',
  name: 'The Global Orators Project',
  shortName: 'Global Orators',
  legalName: 'Global Orators Project',
  tagline: 'Pan-African Forensics, Debate & Voice Sovereignty',
  registrationNumber: 'GOP-KE-2024',
  addressLines: [
    'Pan-African Forensics HQ',
    'P.O. BOX 90119-00100',
    'Nairobi, Kenya'
  ],
  email: 'director@globaloratorsproject.com',
  phone: '+254 700 000 000',
  logoUrl: '/logo.png',
  brandColorHex: '#C89630',
  brandColorRgb: [200, 150, 48],
  invoicePrefix: 'GOP',
  currency: 'KES'
};
