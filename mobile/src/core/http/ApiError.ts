/**
 * Error normalizado de la capa HTTP. La UI nunca ve un `TypeError` de fetch ni un
 * JSON crudo: solo esta clase, con un `kind` que decide qué mensaje y acción mostrar.
 */
export type ApiErrorKind =
  | 'network' // sin conexión / servidor inalcanzable
  | 'timeout' // el servidor no respondió a tiempo
  | 'notFound' // 404
  | 'validation' // 400 con detalle por campo
  | 'server' // 5xx
  | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    // Garantiza `instanceof ApiError` aunque el transpilador baje las clases a ES5.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Forma de un error RFC 7807 (problem+json) tal como lo devuelve la API. */
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  traceId?: string;
  errors?: Record<string, string[]>;
}

const kindFromStatus = (status: number): ApiErrorKind => {
  if (status === 404) {
    return 'notFound';
  }
  if (status === 400) {
    return 'validation';
  }
  if (status >= 500) {
    return 'server';
  }
  return 'unknown';
};

export const apiErrorFromResponse = (
  status: number,
  problem: ProblemDetails | null,
): ApiError =>
  new ApiError(
    kindFromStatus(status),
    problem?.detail ?? problem?.title ?? `Error HTTP ${status}`,
    status,
    problem?.traceId,
  );

/** Mensaje pensado para el usuario final (no técnico). */
export const userMessageFor = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return 'Ocurrió un error inesperado.';
  }
  switch (error.kind) {
    case 'network':
      return 'No pudimos conectar con el servidor. Revisa tu conexión.';
    case 'timeout':
      return 'El servidor tardó demasiado en responder.';
    case 'notFound':
      return 'La tarea no existe o fue eliminada.';
    case 'validation':
      return 'La solicitud no es válida.';
    case 'server':
      return 'El servidor tuvo un problema. Intenta más tarde.';
    default:
      return 'Ocurrió un error inesperado.';
  }
};
