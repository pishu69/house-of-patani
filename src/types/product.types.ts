export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  imageUrls?: string[];
  isActive: boolean;
}

export type ProductCategory = string;

export interface ProductMedia {
  altText: string;
  id: string;
  isPrimary: boolean;
  position: number;
  storagePath: string | null;
  url: string;
}

export interface CatalogProduct {
  active: boolean;
  bestSeller: boolean;
  category: ProductCategory;
  createdAt: string;
  description: string;
  longDescription: string;
details: string;
careInstructions: string;
shippingReturns: string;
deliveryCodTitle: string;
deliveryCodDescription: string;
deliveryPaymentTitle: string;
deliveryPaymentDescription: string;
deliveryShippingTitle: string;
deliveryShippingDescription: string;
deliveryReturnsTitle: string;
deliveryReturnsDescription: string;
deliveryCareTitle: string;
deliveryCareDescription: string;
deliveryPackagingTitle: string;
deliveryPackagingDescription: string;
  featured: boolean;
  id: string;
  images: string[];
  media: ProductMedia[];
  name: string;
  newArrival: boolean;
  originalPrice: number;
  price: number;
  rating: number;
  reviewCount: number;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
}

export interface ProductInput {
  active: boolean;
  bestSeller: boolean;
  category: ProductCategory;
  description: string;
    longDescription: string;
  details: string;
  careInstructions: string;
  shippingReturns: string;
  deliveryCodTitle: string;
  deliveryCodDescription: string;
  deliveryPaymentTitle: string;
  deliveryPaymentDescription: string;
  deliveryShippingTitle: string;
  deliveryShippingDescription: string;
  deliveryReturnsTitle: string;
  deliveryReturnsDescription: string;
  deliveryCareTitle: string;
  deliveryCareDescription: string;
  deliveryPackagingTitle: string;
  deliveryPackagingDescription: string;
  featured: boolean;
  name: string;
  newArrival: boolean;
  originalPrice: number;
  price: number;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
}


export const defaultProductContentFields = {
  longDescription: "",
  details: "",
  careInstructions: "",
  shippingReturns: "",
  deliveryCodTitle: "",
  deliveryCodDescription: "",
  deliveryPaymentTitle: "",
  deliveryPaymentDescription: "",
  deliveryShippingTitle: "",
  deliveryShippingDescription: "",
  deliveryReturnsTitle: "",
  deliveryReturnsDescription: "",
  deliveryCareTitle: "",
  deliveryCareDescription: "",
  deliveryPackagingTitle: "",
  deliveryPackagingDescription: "",
};
