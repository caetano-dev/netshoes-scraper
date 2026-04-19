import * as fs from 'fs/promises';
import * as path from 'path';
import { Product } from '../models/Product';
import { HttpClient } from '../clients/HttpClient';

export interface IFileWriter {
  writeJSON(data: any, filename: string): Promise<void>;
  downloadImages(imageUrls: string[], folderName: string): Promise<void>;
}

export class FileWriter implements IFileWriter {
  private outputDir: string;
  private httpClient: HttpClient;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
    this.httpClient = new HttpClient();
  }

  public async writeJSON(data: any, filename: string): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });

      const filepath = path.join(this.outputDir, filename);
      const content = JSON.stringify(data, null, 2);

      await fs.writeFile(filepath, content, 'utf-8');
      console.log(`JSON salvo em: ${filepath}`);
    } catch (error) {
      throw new Error(
        `Erro ao salvar arquivo: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async downloadImages(imageUrls: string[], folderName: string): Promise<void> {
    try {
      const imagesDir = path.join(this.outputDir, folderName);
      await fs.mkdir(imagesDir, { recursive: true });

      for (const url of imageUrls) {
        try {
          const response = await this.httpClient.get(url, { responseType: 'arraybuffer' });
          const filename = this.extractFilename(url);
          const filepath = path.join(imagesDir, filename);

          await fs.writeFile(filepath, Buffer.from(response.data));
          console.log(`Imagem baixada: ${filepath}`);
        } catch (error) {
          console.warn(`Falha ao baixar imagem ${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      throw new Error(
        `Erro ao baixar imagens: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private extractFilename(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return path.basename(pathname);
  }
}
