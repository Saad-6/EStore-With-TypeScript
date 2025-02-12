export interface Category {
  id: number;
  name: string;
  thumbNailUrl: string;
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
  displayType:string;
}

export interface VariantOption {
  id: number;
  value: string;
  priceAdjustment: number;

  stock : number;
  optionImages?: { url: string; altText: string }[];
}
export interface Review{
  id: number
  stars: number
  givenBy: string
  comment: string
  postedAt: string
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
  reviews : Review[]
}

export interface FAQ{
id: number;
question : string;
answer  : string;
product : Product;
}
export interface ProductDTO {

  id?: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  brand: string;
  category: Category;
  slug: string;
  isActive: boolean;
  seo: SEODTO;
  primaryImage: ProductImageDTO;
  images: ProductImageDTO[];
  variants: VariantDTO[];
}
export interface SEODTO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
}

export interface ProductImageDTO {
  url: string;
  altText: string;
}

export interface VariantOptionDTO {
  id?: number;
  value: string;
  optionImages?: ProductImageDTO[];
  priceAdjustment: number;
  stock: number;
  sku?: string;
}

export interface VariantDTO {
  id?: number;
  name: string;
  displayType: string;
  options: VariantOptionDTO[];
}

/* Layout Interfaces */
export interface HeroCarouselSlide {
  id?: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
}
export interface SimpleProduct{
  id : number;
  name : string;
  imageUrl : string;
  slug : string;
  price : number;
}
export interface SimpleCategory{
  id : number;
  name : string;
  imageUrl : string;
}



export interface HomePageSettings {
  id?: number;
  heroCarousel: HeroCarouselSlide[];
  featuredProducts: SimpleProduct[];
  newArrivals: SimpleProduct[];
  categories: SimpleCategory[];

}

export interface HomePageLayout {
  id?: number;
  name: string;
  isActive: boolean;
  settings: HomePageSettings;
}
export interface SimpleProductDTO {
  id: number;
  name: string;
  imageUrl: string;
  slug?: string;
  price?: number;
}

export interface SimpleCategoryDTO {
  id: number;
  name: string;
  imageUrl: string;
}
