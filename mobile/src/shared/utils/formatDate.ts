/**
 * Fechas: la API envía UTC (ISO 8601) y aquí se muestran en la zona del dispositivo.
 * Se formatea "a mano" para no depender de que el motor JS traiga datos de Intl
 * completos para todos los locales.
 */
const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const pad = (n: number) => String(n).padStart(2, '0');

export const formatDate = (date: Date): string =>
  `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

export const formatDateTime = (date: Date): string =>
  `${formatDate(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "hace 5 min", "hace 3 h", "hace 2 d" o la fecha si es más antigua que una semana. */
export const formatRelative = (date: Date, now: Date = new Date()): string => {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) {
    return 'justo ahora';
  }
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `hace ${days} d`;
  }
  return formatDate(date);
};
