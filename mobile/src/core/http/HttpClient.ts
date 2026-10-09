import {
  ApiError,
  apiErrorFromResponse,
  type ProblemDetails,
} from './ApiError';

export type QueryParams = Record<string, string | number | undefined | null>;

export interface RequestOptions {
  params?: QueryParams;
  /** Permite al llamador cancelar (p. ej. el usuario cambió de filtro o salió de la pantalla). */
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
}

type FetchFn = typeof fetch;

const buildQuery = (params?: QueryParams): string => {
  if (!params) {
    return '';
  }
  const parts = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

const safeJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

/**
 * Cliente HTTP mínimo sobre `fetch` (sin axios: no hace falta para GET + JSON).
 * Responsabilidades: URL + query string, timeout, cancelación y normalizar errores
 * a {@link ApiError}. No sabe nada de "tareas": es infraestructura reutilizable.
 */
export const createHttpClient = (
  baseUrl: string,
  timeoutMs: number,
  fetchFn: FetchFn = fetch,
): HttpClient => ({
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    // Propaga la cancelación externa al controller interno.
    const onExternalAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onExternalAbort);

    try {
      const response = await fetchFn(
        `${baseUrl}${path}${buildQuery(options.params)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw apiErrorFromResponse(
          response.status,
          await safeJson<ProblemDetails>(response),
        );
      }

      const body = await safeJson<T>(response);
      if (body === null) {
        throw new ApiError(
          'unknown',
          'Respuesta vacía o inválida del servidor.',
          response.status,
        );
      }
      return body;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (timedOut) {
        throw new ApiError('timeout', 'Tiempo de espera agotado.');
      }
      if (options.signal?.aborted) {
        // Cancelación pedida por el llamador: se relanza tal cual para que la ignore.
        throw error;
      }
      throw new ApiError('network', 'No se pudo conectar con el servidor.');
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onExternalAbort);
    }
  },
});

/** true si el error proviene de una cancelación intencional (no se muestra al usuario). */
export const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError';
