export interface Category {
  id: number;
  name: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
}

export interface ProductImage {
  url: string;
  altText: string;
}

export interface Variant {
  id: number;
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  id: number;
  value: string;
  priceAdjustment: number;
  optionImages?: { url: string; altText: string }[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  brand: string;
  categoryId: number;
  category: Category;
  slug: string;
  isActive: boolean;
  seo: SEO;
  primaryImage: ProductImage;
  images: ProductImage[];
  variants: Variant[];
}

export interface ProductDTO {
  id?: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  brand: string;
  categoryId: number;
  slug: string;
  isActive: boolean;
  seo: SEO;
  primaryImage: ProductImage;
  images: ProductImage[];
}