import type { OfficialSource } from '@/types/domain';

/**
 * Official sources (CLAUDE.md 1.1.1, Annex B). Each URL was opened again on 12/11/2026 before
 * publishing. A source that stopped responding stays out and is logged in docs/questions.md; it is
 * never replaced with an unofficial one.
 */
const VERIFIED = '2026-11-12';

export const OFFICIAL_SOURCES = [
  { id: 'bcra-a8407', name: 'BCRA, Comunicación "A" 8407: garantía de los depósitos', url: 'https://www.bcra.gob.ar/Pdfs/comytexord/A8407.pdf' },
  { id: 'bcra-depinv', name: 'BCRA, texto ordenado "Depósitos e inversiones a plazo"', url: 'https://www.bcra.gob.ar/archivos/Pdfs/texord/t-depinv.pdf', verifiedAt: '2026-11-14' },
  { id: 'bcra-tasas', name: 'BCRA, texto ordenado "Tasas de interés en las operaciones de crédito"', url: 'https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-tasint.pdf' },
  { id: 'gob-usuarios-financieros', name: 'argentina.gob.ar: costo financiero total y Central de Deudores', url: 'https://www.argentina.gob.ar/node/371108' },
  { id: 'ley-25065', name: 'Ley 25.065 de tarjetas de crédito', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-25065-1998-55556/texto' },
  { id: 'bcra-a6885', name: 'BCRA, Comunicación "A" 6885: proveedores de servicios de pago', url: 'https://www.bcra.gob.ar/archivos/Pdfs/comytexord/A6885.pdf' },
  { id: 'bcra-transferencias', name: 'BCRA, Transferencias 3.0 y QR interoperable', url: 'https://www.bcra.gob.ar/transferencias-3-0/' },
  { id: 'bcra-pagos-minoristas', name: 'BCRA, Informe de Pagos Minoristas (septiembre de 2026)', url: 'https://www.bcra.gob.ar/publicaciones/informe-de-pagos-minoristas-septiembre-de-2026/' },
  { id: 'bcra-registro-psp', name: 'BCRA, Registro de proveedores de servicios de pago', url: 'https://www.bcra.gob.ar/registro-de-proveedores-de-servicios-de-pago/' },
  { id: 'bcra-entidades', name: 'BCRA, Entidades financieras', url: 'https://www.bcra.gob.ar/entidades-financieras/' },
  { id: 'gob-agentes', name: 'argentina.gob.ar: agentes registrados y subcuenta comitente', url: 'https://www.argentina.gob.ar/node/356934' },
  { id: 'cnv-agentes', name: 'CNV, Registro Público de Agentes', url: 'https://www.cnv.gov.ar/sitioWeb/RegistrosPublicos/Agentes' },
  { id: 'cnv-alertas', name: 'CNV, Alertas al inversor', url: 'https://www.argentina.gob.ar/cnv/alertas-al-inversor' },
  { id: 'cnv-idoneos', name: 'CNV, Registro de Idóneos', url: 'https://www.cnv.gov.ar/SitioWeb/RegistrosPublicos/Idoneos' },
  { id: 'gob-fci', name: 'argentina.gob.ar: fondos comunes de inversión', url: 'https://www.argentina.gob.ar/node/268483' },
  { id: 'cnv-psav', name: 'CNV, Registro de proveedores de servicios de activos virtuales (PSAV)', url: 'https://www.cnv.gov.ar/SitioWeb/RegistrosPublicos/Psav' },
  { id: 'byma-cedears', name: 'BYMA, CEDEARs y ratios de conversión', url: 'https://byma.com.ar/productos/productos-financieros/cedears' },
  { id: 'bymadata', name: 'BYMADATA, el sitio de datos de BYMA (precios reales)', url: 'https://open.bymadata.com.ar/#/dashboard', verifiedAt: '2026-11-14' },
  { id: 'byma-horarios', name: 'BYMA, horarios de negociación', url: 'https://byma.com.ar/mercado/horarios' },
  { id: 'cajval-cedears', name: 'Caja de Valores, CEDEARs y CEDEARs de ETF', url: 'https://cajadevalores.com.ar/Servicios/Cedears' },
  { id: 'byma-alycs', name: 'BYMA, nómina de ALyC', url: 'https://www.byma.com.ar/mercado/para-agentes-miembros/listado-de-alycs' },
  { id: 'indec', name: 'INDEC, índice de precios al consumidor', url: 'https://www.indec.gob.ar' },
  // Real values of the daily snapshot (D-79, D-264), verified on 15/11/2026 (docs/market-data.md)
  { id: 'bcra-api', name: 'BCRA, principales variables (API de estadísticas monetarias)', url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp', verifiedAt: '2026-11-15' },
  { id: 'indec-via-bcra', name: 'INDEC, IPC publicado por el BCRA en sus principales variables', url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp', verifiedAt: '2026-11-15' },
  { id: 'indec-datos', name: 'INDEC, IPC nacional en la API de series de tiempo de datos.gob.ar', url: 'https://datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26', verifiedAt: '2026-11-15' },
].map((source) => ({ verifiedAt: VERIFIED, ...source })) satisfies OfficialSource[];

export type OfficialSourceId = (typeof OFFICIAL_SOURCES)[number]['id'];

export function sourceById(id: string): OfficialSource | undefined {
  return OFFICIAL_SOURCES.find((s) => s.id === id);
}
