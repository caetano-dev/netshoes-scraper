import { HttpClient, IHttpClient } from '../clients/HttpClient';
import { NetshoesParser, IParser } from '../parsers/NetshoesParser';
import { Product } from '../models/Product';

export interface IScraper {
  scrape(url: string): Promise<Product>;
}

export class Scraper implements IScraper {
  private httpClient: IHttpClient;
  private parser: IParser;

  constructor(httpClient?: IHttpClient, parser?: IParser) {
    this.httpClient = httpClient || new HttpClient();
    this.parser = parser || new NetshoesParser();
  }

  public async scrape(url: string): Promise<Product> {
    try {
      console.log(`Acessando URL: ${url}`);
      
      this.validateUrl(url);

      const response = await this.httpClient.get(url);
      const html = response.data;

      if (!html || html.length === 0) {
        throw new Error('HTML vazio retornado da URL');
      }
      
      const product = this.parser.parse(html);

      if (!this.isValidProduct(product)) {
        console.warn(
          'Nenhum dado de produto foi extraído. Verifique se a URL está correta.'
        );
      }
      
      return product;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Erro ao fazer scraping: ${errorMessage}`);
      throw error;
    }
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new Error(`URL inválida: ${url}`);
    }
  }

  private isValidProduct(product: Product): boolean {
    return !!(product.title && product.price && product.imageUrls.length > 0 && product.description);
  }
}
