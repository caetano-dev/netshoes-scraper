import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IHttpClient {
  get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<any>>;
}

export class HttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      maxRedirects: 5,
    });
  }

  public async get(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<any>> {
    try {
      const response = await this.client.get<any>(url, config);
      return response;
    } catch (error) {
      throw new Error(
        `HTTP request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
