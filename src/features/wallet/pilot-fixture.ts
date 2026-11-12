/**
 * Visual pilot only (step 4): Mariana's wallet at level 6, written by hand to show P1. From step 6
 * the wallet engine generates this state (D-131) and this file is deleted. All amounts are
 * fictitious and coherent with docs/wallet-engine.md (profile of section 4, demo state of 7).
 */
export const PILOT = {
  personName: 'Mariana López',
  firstName: 'Mariana',
  alias: 'alcancia.practica.mariana',
  cvu: '0000000 0000000 EJEMPLO 00',
  day: 154,
  dateIso: '2027-04-19',
  balance: '412380.50',
  monthlyInflation: '0.03',
  completedLevels: 6,
  currentLevel: 6,
  emergency: { saved: '1300000', target: '1950000', months: 2, monthsTarget: 3 },
  pockets: [
    { id: 'emergency', name: 'Fondo de emergencia', amount: '1300000.00', icon: 'shield' },
    { id: 'savings', name: 'Ahorro', amount: '256991.77', icon: 'savings' },
  ],
  mission: { id: 'mission-4', title: '¿Cuenta o fondo?', minutes: 5, step: 2, steps: 4 },
  movements: [
    { id: 'm1', kind: 'yield', counterparty: 'Rendimiento de la cuenta remunerada', amount: '338.94', date: '19/04/2027', icon: 'trending_up' },
    { id: 'm2', kind: 'qr_payment', counterparty: 'Almacén Don Ramiro', amount: '-55065.52', date: '17/04/2027', icon: 'qr_code_2' },
    { id: 'm3', kind: 'bill', counterparty: 'Luz · Energía del Sur (ficticia)', amount: '-30141.13', date: '12/04/2027', icon: 'bolt' },
    { id: 'm4', kind: 'transfer_out', counterparty: 'Alquiler · alias inmobiliaria.ejemplo', amount: '-415236.26', date: '05/04/2027', icon: 'send_money' },
    { id: 'm5', kind: 'income', counterparty: 'Sueldo · Andina Servicios S.A.', amount: '1404109.24', date: '01/04/2027', icon: 'payments' },
  ],
} as const;
