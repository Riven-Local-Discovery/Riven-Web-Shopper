// Domain types shared by the API layer, the mock backend and the screens.
// If the real backend uses different field names, adapt them in src/api/endpoints.ts
// so screens keep working against these shapes.

export type ID = string;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserLocation extends GeoPoint {
  city: string;
  country: string;
  address?: string;
}

export interface User {
  id: ID;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  interests: string[];
  location?: UserLocation;
  stats: { orders: number; favorites: number; following: number };
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

// ---- Discovery & bazaars ----

export type BazaarStatus = 'upcoming' | 'live' | 'ended';

export interface VendorSummary {
  id: ID;
  name: string;
  tagline: string;
  logoUrl: string;
  rating: number;
  reviewsCount: number;
}

export interface Bazaar {
  id: ID;
  name: string;
  tags: string[];
  coverUrl: string;
  startDate: string;
  endDate: string;
  openTime: string;
  closeTime: string;
  address: string;
  city: string;
  location: GeoPoint;
  distanceKm?: number;
  description: string;
  status: BazaarStatus;
  vendors: VendorSummary[];
  vendorsCount: number;
  schedule: { day: string; time: string; title: string }[];
  isSaved: boolean;
}

export interface DiscoveryFeed {
  upcoming: Bazaar[];
  nearby: Bazaar[];
  trendingProducts: Product[];
}

export interface Booth {
  id: ID;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zone?: string;
  vendor?: VendorSummary;
}

export interface BazaarLayout {
  bazaarId: ID;
  width: number;
  height: number;
  booths: Booth[];
  landmarks: { label: string; x: number; y: number; icon: 'entrance' | 'food' | 'stage' | 'restroom' }[];
}

// ---- Catalog ----

export interface Category {
  id: ID;
  name: string;
  imageUrl: string;
  productsCount: number;
}

export interface Vendor extends VendorSummary {
  coverUrl: string;
  about: string;
  city: string;
  shipsNationwide: boolean;
  exchangeDays: number;
  foundedYear: number;
  gallery: string[];
  followersCount: number;
  isFollowing: boolean;
}

export interface Product {
  id: ID;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  categoryId: ID;
  vendor: VendorSummary;
  colors: string[];
  sizes: string[];
  stock: number;
  isFavorite: boolean;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductQuery {
  q?: string;
  categoryId?: ID;
  vendorId?: ID;
  bazaarId?: ID;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

// ---- Cart & checkout ----

export interface CartItem {
  id: ID;
  product: Pick<Product, 'id' | 'name' | 'images' | 'price' | 'currency' | 'stock' | 'vendor'>;
  quantity: number;
  color?: string;
  size?: string;
  isFavorite: boolean;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
}

export type PaymentMethod = 'card' | 'wallet' | 'fawry' | 'apple_pay' | 'cash_on_delivery';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

export interface CheckoutRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResponse {
  orderGroupId: ID;
  orderIds: ID[];
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'not_required';
  /** Hosted payment page (e.g. Paymob iframe). Absent for cash on delivery. */
  paymentUrl?: string;
}

// ---- Orders ----

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: ID;
  productId: ID;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: ID;
  number: string;
  orderGroupId: ID;
  status: OrderStatus;
  createdAt: string;
  vendor: VendorSummary;
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  isRated: boolean;
  cancelReason?: string;
}

// ---- Social ----

export type FavoriteType = 'product' | 'vendor' | 'bazaar';

export type Favorite =
  | { id: ID; type: 'product'; createdAt: string; product: Product }
  | { id: ID; type: 'vendor'; createdAt: string; vendor: VendorSummary }
  | { id: ID; type: 'bazaar'; createdAt: string; bazaar: Bazaar };

export interface Follow {
  id: ID;
  createdAt: string;
  vendor: VendorSummary & { followersCount: number };
}

export interface Rating {
  id: ID;
  rating: number;
  comment: string;
  createdAt: string;
  author: { id: ID; fullName: string; avatarUrl?: string };
  productName?: string;
}

export interface RatingsSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  items: Rating[];
}

export interface CreateRatingRequest {
  orderId: ID;
  vendorId: ID;
  rating: number;
  comment: string;
}
