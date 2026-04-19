import * as cheerio from 'cheerio';
import { Product, IProduct } from '../models/Product';

export interface IParser {
  parse(html: string): Product;
}

export class NetshoesParser implements IParser {
  public parse(html: string): Product {
    try {
      const product = this.parseJsonLD(html);
      if (this.isValidProduct(product)) {
        return product;
      }

      const stateProduct = this.parseWindowState(html);
      if (this.isValidProduct(stateProduct)) {
        return stateProduct;
      }

      return this.parseBySelectors(html);
    } catch (error) {
      console.error(
        `Parser error: ${error instanceof Error ? error.message : String(error)}`
      );
      return new Product();
    }
  }

  private parseJsonLD(html: string): Product {
    const product = new Product();
    try {
      const jsonLdMatch = html.match(
        /<script[^>]+type="application\/ld\+json"[^>]*>({[\s\S]*?})<\/script>/i
      );

      if (jsonLdMatch && jsonLdMatch[1]) {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        
        const productNode = jsonLd['@graph'] 
          ? jsonLd['@graph'].find((node: any) => node['@type'] === 'Product') 
          : jsonLd;

        if (productNode) {
          product.title = productNode.name || null;
          if (productNode.offers) {
            if (productNode.offers.price) {
              product.price = `${productNode.offers.priceCurrency} ${productNode.offers.price}`;
            } else if (productNode.offers.lowPrice) {
              product.price = `${productNode.offers.priceCurrency} ${productNode.offers.lowPrice}`;
            }
          }
          if (productNode.image && Array.isArray(productNode.image)) {
            product.imageUrls = productNode.image;
          }
          product.description = productNode.description || null;
        }
      }
    } catch (error) {
      console.warn('JSON-LD parsing failed.');
    }
    return product;
  }

  private parseWindowState(html: string): Product {
    const product = new Product();
    try {
      const stateMatch = html.match(
        /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/i
      );

      if (stateMatch && stateMatch[1]) {
        const stateJson = JSON.parse(stateMatch[1]);
        const currentProduct = stateJson?.Product?.currentProduct;

        if (currentProduct) {
          product.title = currentProduct.name || null;
          
          if (currentProduct.prices && currentProduct.prices[0]) {
            product.price = `R$ ${currentProduct.prices[0].finalPriceWithoutPaymentBenefitDiscount / 100}`;
          }
          
          if (currentProduct.images && currentProduct.images.zooms) {
            product.imageUrls = currentProduct.images.zooms;
          }
          
          product.description = currentProduct.description || null;
        }
      }
    } catch (error) {
      console.warn('Window state parsing failed.');
    }
    return product;
  }

  private parseBySelectors(html: string): Product {
    const product = new Product();
  
    try {
      const $ = cheerio.load(html);
  
      product.title = $('h1.product-name').text().trim() || null;
  
      const desc = $('p.features--description').text().trim();
      product.description = desc ? desc.substring(0, 500) : null;
  
      const extractedImages = new Set<string>();
      $('img.carousel-item-figure__image').each((_, element) => {
        let src = $(element).attr('src');
        if (src) {
          extractedImages.add(src.split('?')[0]); 
        }
      });
      product.imageUrls = Array.from(extractedImages);
  
      const priceRegex = /"(?:price|lowPrice)"\s*:\s*"([\d.]+)"/i;
      const priceMatch = html.match(priceRegex);
      if (priceMatch && priceMatch[1]) {
        product.price = `R$ ${priceMatch[1].replace('.', ',')}`;
      } else {
        product.price = null;
      }
  
    } catch (error) {
      console.error('CSS parsing failed.');
    }
  
    return product;
  }

  private isValidProduct(product: Product): boolean {
    return !!(product.title || product.price || product.imageUrls.length > 0 || product.description);
  }
}
