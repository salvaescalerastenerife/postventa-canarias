// Tarifas versionadas por fecha.
// Para futuras subidas: añade un nuevo bloque con desde: "AAAA-MM-DD".
// Cada parte guarda una copia de las tarifas usadas para no romper partes antiguos.

export const TARIFAS_VERSION = "2026-04-01";

export const TARIFAS_HISTORICO = [
  {
    desde: "2000-01-01",
    version: "legacy",
    instalacion: {
      P_INST: 27.95,
      P_DESPL: 19.28,
      P_KM: 0.31,
      FURGON: 80.00,
      TECNICOS_INST: 2
    },
    reparacion: {
      P_REP: 32.14,
      P_DESPL: 19.28,
      P_KM: 0.31,
      P_PILA: 1.00
    },
    mantenimiento: {
      CLIENTE_ANTIGUO: 99.00,
      CONTRATO_TRANQUILIDAD: 102.00,
      P_PILA: 1.00
    }
    baterias: [
  { value: 36.84, label: "Batería 12V 2Amp · 36,84€" },
  { value: 73.15, label: "Batería 12V 9Amp · 73,15€" },
  { value: 108.10, label: "Batería 12V 12Amp · 108,10€" },
  { value: 126.42, label: "Batería 12V 18Amp · 126,42€" }
]
  },
{
  desde: "2026-04-01",
  version: "abril-2026",
  instalacion: {
    P_INST: 27.12,
    P_DESPL: 18.71,
    P_KM: 0.30,
    FURGON: 80.00,
    TECNICOS_INST: 2
  },
  reparacion: {
    P_REP: 31.18,
    P_DESPL: 18.71,
    P_KM: 0.30,
    P_PILA: 1.00
  },
  mantenimiento: {
    CLIENTE_ANTIGUO: 99.00,
    CONTRATO_TRANQUILIDAD: 102.00,
    P_PILA: 1.00
  }
  baterias: [
  { value: 35.77, label: "Batería 12V 2Amp · 35,77€" },
  { value: 71.02, label: "Batería 12V 9Amp · 71,02€" },
  { value: 104.95, label: "Batería 12V 12Amp · 104,95€" },
  { value: 122.74, label: "Batería 12V 18Amp · 122,74€" }
]
}
];

export function getTarifasForDate(fecha) {
  const f = String(fecha || "").slice(0, 10);
  let selected = TARIFAS_HISTORICO[0];

  for (const item of TARIFAS_HISTORICO) {
    if (!f || item.desde <= f) selected = item;
  }

  return (typeof structuredClone === "function")
    ? structuredClone(selected)
    : JSON.parse(JSON.stringify(selected));
}
