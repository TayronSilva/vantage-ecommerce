export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'SUPPORT' | 'VIEWER' | 'CUSTOMER';
  isActive: boolean;
  permissions: string[];
  profiles: any[];
}

export interface AuthResponse {
  access_token: string;
  name: string;
  email: string;
  permissions: string[];
}

export interface ProductColor {
  name: string;
  hex: string;
  img: string;
  stockId: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  gender?: string;
  isBestSeller?: boolean;
  rating: number;
  category: string;
  description: string;
  colors: ProductColor[];
  stockQuantity: number;
  images?: { id: string; alt: string; isMain: boolean; url: string }[];
}

export interface CartItem {
  cartId: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedColor: string;
  img: string;
  stockId: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  price: number;
  color: string;
  size?: string | null;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number | string;
  freight: number | string;
  total: number | string;
  status: 'Pendente' | 'Pago' | 'Cancelado' | 'Enviado' | 'PENDING' | 'PAID' | 'CANCELED' | 'ENVIADO' | 'EXCHANGED' | 'RETURNED' | 'EXCHANGE_REQUESTED';
  createdAt: string;
  paymentMethod: 'PIX' | 'CARD' | 'BOLETO';
  paymentType?: string;
  address?: Address;
  user?: User;
}

export interface OrderCreateResponse {
  message: string;
  order: Order;
  payment: {
    paymentId?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    barcode?: string;
    ticketUrl?: string;
    paymentMethod?: string;
    message?: string;
    total?: number;
    orderId?: string;
  } | null;
}

export interface Address {
  id: number;
  name: string;
  zipCode: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  additional?: string;
  reference?: string;
  isDefault: boolean;
}

export type View = 'home' | 'store' | 'product' | 'checkout' | 'success' | 'profile' | 'admin-dashboard' | 'login' | 'register' | 'addresses' | 'orders' | 'wishlist' | 'moderation' | 'returns' | 'privacy' | 'terms';
