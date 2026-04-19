export interface IProduct {
  title: string | null;
  price: string | null;
  imageUrls: string[];
  description: string | null;
}

export class Product implements IProduct {
  public title: string | null;
  public price: string | null;
  public imageUrls: string[];
  public description: string | null;

  constructor(
    title: string | null = null,
    price: string | null = null,
    imageUrls: string[] = [],
    description: string | null = null
  ) {
    this.title = title;
    this.price = price;
    this.imageUrls = imageUrls;
    this.description = description;
  }

  public toJSON(): IProduct {
    return {
      title: this.title,
      price: this.price,
      imageUrls: this.imageUrls,
      description: this.description,
    };
  }
}
