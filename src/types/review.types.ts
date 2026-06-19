export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
}

export interface ProductReview {
  author: string;
  comment: string;
  createdAt: string;
  id: string;
  rating: number;
  title: string;
}
