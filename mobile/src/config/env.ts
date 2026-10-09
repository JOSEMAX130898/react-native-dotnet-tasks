import { Platform } from 'react-native';

/**
 * Configuración de entorno en un solo lugar.
 *
 * - Android emulator: `10.0.2.2` es el alias del host (localhost del PC).
 * - iOS simulator: comparte red con el host, `localhost` funciona.
 * - Dispositivo físico: reemplazar por la IP LAN del PC (p. ej. http://192.168.1.20:5080).
 *
 * En un proyecto grande esto vendría de variables por build flavor
 * (react-native-config / .env por ambiente); aquí se evita una dependencia nativa extra.
 */
const DEFAULT_HOST = Platform.select({
  android: 'http://10.0.2.2:5080',
  default: 'http://localhost:5080',
});

export const env = {
  apiBaseUrl: `${DEFAULT_HOST}/api/v1`,
  /** Tiempo máximo de espera por petición antes de abortar. */
  requestTimeoutMs: 10_000,
  /** Tamaño de página usado por el listado (scroll infinito). */
  pageSize: 15,
} as const;
