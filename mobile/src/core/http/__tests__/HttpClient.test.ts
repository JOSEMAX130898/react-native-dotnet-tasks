import { ApiError, userMessageFor } from '../ApiError';
import { createHttpClient } from '../HttpClient';

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);

describe('HttpClient', () => {
  it('construye la URL omitiendo parámetros vacíos', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, { ok: true }));
    const client = createHttpClient('http://api/v1', 1000, fetchFn);

    await client.get('/tasks', {
      params: { status: 'Pending', priority: undefined, page: 2, q: '' },
    });

    expect(fetchFn.mock.calls[0][0]).toBe(
      'http://api/v1/tasks?status=Pending&page=2',
    );
  });

  it('convierte un problem+json 404 en ApiError notFound con traceId', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse(404, {
        title: 'No',
        detail: 'Tarea 9 no existe',
        traceId: 't-1',
      }),
    );
    const client = createHttpClient('http://api', 1000, fetchFn);

    await expect(client.get('/tasks/9')).rejects.toMatchObject({
      kind: 'notFound',
      status: 404,
      message: 'Tarea 9 no existe',
      traceId: 't-1',
    });
  });

  it('clasifica 5xx sin cuerpo como error de servidor', async () => {
    const fetchFn = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error('no json');
      },
    });
    const client = createHttpClient(
      'http://api',
      1000,
      fetchFn as unknown as typeof fetch,
    );

    await expect(client.get('/x')).rejects.toMatchObject({
      kind: 'server',
      status: 503,
    });
  });

  it('traduce un fallo de red a ApiError network', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValue(new TypeError('Network request failed'));
    const client = createHttpClient('http://api', 1000, fetchFn);

    const error = (await client.get('/x').catch(e => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe('network');
    expect(userMessageFor(error)).toMatch(/conexión/);
  });

  it('aborta y reporta timeout si el servidor no responde', async () => {
    jest.useFakeTimers();
    const fetchFn = jest.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const abort = new Error('Aborted');
            abort.name = 'AbortError';
            reject(abort);
          });
        }),
    );
    const client = createHttpClient(
      'http://api',
      50,
      fetchFn as unknown as typeof fetch,
    );

    const promise = client.get('/lento');
    jest.advanceTimersByTime(60);

    await expect(promise).rejects.toMatchObject({ kind: 'timeout' });
    jest.useRealTimers();
  });

  it('relanza la cancelación del llamador sin convertirla en error de red', async () => {
    const controller = new AbortController();
    const fetchFn = jest.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const abort = new Error('Aborted');
            abort.name = 'AbortError';
            reject(abort);
          });
        }),
    );
    const client = createHttpClient(
      'http://api',
      5000,
      fetchFn as unknown as typeof fetch,
    );

    const promise = client.get('/x', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
