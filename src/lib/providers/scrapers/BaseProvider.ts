import { IStreamingProvider, ProviderResult, StreamQuery } from '../types';

export abstract class BaseProvider implements IStreamingProvider {
  abstract name: string;
  abstract priority: number;
  disabled: boolean = false;

  protected defaultHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  abstract resolve(query: StreamQuery): Promise<ProviderResult | null>;

  protected async safeFetch(url: string, options: RequestInit = {}): Promise<Response | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500); // 7.5s scraper timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.warn(`[${this.name}] Request failed for ${url}:`, error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
