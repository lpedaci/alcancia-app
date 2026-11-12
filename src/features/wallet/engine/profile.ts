import type { BudgetCategory, ExpenseAmounts, ExpenseKey, MovementType } from './types';

/**
 * Fictitious expense profile, the same for Mariana and Diego (docs/wallet-engine.md, section 4).
 * Amounts of month 1 at day-0 prices; each entry is charged on the given days of the month, split
 * in equal parts. Counterparties are fictitious and never imitate a brand (1.1.1).
 */
export const SALARY_START = '1284958.86'; // D-54: net of the workshop's example payslip

export interface ExpenseDef {
  key: ExpenseKey;
  category: BudgetCategory;
  /** Days of the simulated month (1 to 30) when it is charged. */
  days: number[];
  type: MovementType;
  counterparty: string;
  /** How its price follows inflation (section 5). */
  update: 'monthly' | 'quarterly' | 'fixed';
}

export const EXPENSE_DEFS: ExpenseDef[] = [
  { key: 'rent', category: 'needs', days: [5], type: 'transfer_out', counterparty: 'Alquiler · alias inmobiliaria.ejemplo', update: 'quarterly' },
  { key: 'groceries', category: 'needs', days: [3, 10, 17, 24], type: 'qr_payment', counterparty: 'Almacén Don Ramiro', update: 'monthly' },
  { key: 'electricity', category: 'needs', days: [12], type: 'bill', counterparty: 'Luz · Energía del Sur (ficticia)', update: 'monthly' },
  { key: 'gas', category: 'needs', days: [12], type: 'bill', counterparty: 'Gas · Gas del Valle (ficticia)', update: 'monthly' },
  { key: 'phone', category: 'needs', days: [15], type: 'bill', counterparty: 'Celular · Línea Ejemplo', update: 'monthly' },
  { key: 'transport', category: 'needs', days: [2, 16], type: 'qr_payment', counterparty: 'Transporte · Tarjeta de viaje de ejemplo', update: 'monthly' },
  { key: 'outings', category: 'wants', days: [6, 13, 20, 27], type: 'qr_payment', counterparty: 'Salidas · Bar La Esquina (ficticio)', update: 'monthly' },
  { key: 'clothes', category: 'wants', days: [20], type: 'qr_payment', counterparty: 'Ropa · Tienda Andes (ficticia)', update: 'monthly' },
  { key: 'streaming', category: 'wants', days: [8], type: 'bill', counterparty: 'Streaming · Pantalla Ejemplo', update: 'monthly' },
  { key: 'subscription', category: 'wants', days: [1], type: 'bill', counterparty: 'Suscripción · Club Premium (ficticio)', update: 'fixed' },
];

export const EXPENSES_START: ExpenseAmounts = {
  rent: '380000.00',
  groceries: '190000.00',
  electricity: '26000.00',
  gas: '16000.00',
  phone: '18000.00',
  transport: '20000.00',
  outings: '120000.00',
  clothes: '60000.00',
  streaming: '6500.00',
  subscription: '4990.00', // D-55, does not change with inflation
};

export const EMPLOYER = 'Sueldo · Andina Servicios S.A.';
