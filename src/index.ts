import { Scraper } from './scrapers/Scraper';
import { FileWriter } from './utils/FileWriter';

const TARGET_URL =
  'https://www.netshoes.com.br/p/tenis-adidas-breaknet-masculino-NQQ-4378-060';

async function main(): Promise<void> {
  try {
    const scraper = new Scraper();
    const fileWriter = new FileWriter('./output');
    const product = await scraper.scrape(TARGET_URL);
    
    console.log('\nJSON Output:');
    console.log(JSON.stringify(product.toJSON(), null, 2));
    
    await fileWriter.writeJSON(product.toJSON(), 'produto.json');
    
    if (product.imageUrls.length > 0) {
      console.log('\nBaixando imagens...');
      await fileWriter.downloadImages(product.imageUrls, 'images');
      console.log('Todas as imagens foram baixadas!');
    }

  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
