import { api } from './client';
import type {
  AuthResponse,
  AuthTokens,
  Bazaar,
  BazaarLayout,
  Cart,
  Category,
  CheckoutRequest,
  CheckoutResponse,
  CreateRatingRequest,
  DiscoveryFeed,
  Favorite,
  FavoriteType,
  Follow,
  GeoPoint,
  ID,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductQuery,
  Rating,
  RatingsSummary,
  User,
  UserLocation,
  Vendor,
} from './types';

// ---- 01. Authentication & session ----
export const authApi = {
  register: (body: { fullName: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),
};

// ---- 02. Shopper profile & account ----
export type UpdateProfileBody = Partial<Pick<User, 'fullName' | 'phone' | 'interests'>> & {
  /** null removes the current photo. */
  avatarUrl?: string | null;
};

export const usersApi = {
  me: () => api.get<User>('/users/me').then((r) => r.data),
  update: (body: UpdateProfileBody) => api.patch<User>('/users/me', body).then((r) => r.data),
  // Not in the original endpoint list — adjust the path/field name to match the backend.
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file, file.name);
    // The browser sets the multipart Content-Type (with its boundary) for FormData bodies.
    return api.post<User>('/users/me/avatar', form).then((r) => r.data);
  },
  updateLocation: (body: UserLocation) => api.patch<User>('/users/me/location', body).then((r) => r.data),
  remove: (password: string) => api.delete<void>('/users/me', { data: { password } }).then((r) => r.data),
};

// ---- 04. Discovery feed & bazaars ----
export type BazaarFilter = 'all' | 'upcoming' | 'weekend';

export const bazaarsApi = {
  discovery: (near?: GeoPoint) =>
    api.get<DiscoveryFeed>('/discovery/bazaars', { params: near }).then((r) => r.data),
  list: (params: { when?: BazaarFilter; q?: string } & Partial<GeoPoint>) =>
    api.get<Paginated<Bazaar>>('/bazaars', { params }).then((r) => r.data),
  get: (id: ID) => api.get<Bazaar>(`/bazaars/${id}`).then((r) => r.data),
  layout: (id: ID) => api.get<BazaarLayout>(`/bazaars/${id}/layout`).then((r) => r.data),
};

// ---- 05. Catalog ----
export const catalogApi = {
  categories: () => api.get<Category[]>('/categories').then((r) => r.data),
  vendor: (id: ID) => api.get<Vendor>(`/vendors/${id}`).then((r) => r.data),
  products: (params: ProductQuery) => api.get<Paginated<Product>>('/products', { params }).then((r) => r.data),
  product: (id: ID) => api.get<Product>(`/products/${id}`).then((r) => r.data),
};

// ---- 06. Shopping cart ----
export const cartApi = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  addItem: (body: { productId: ID; quantity: number; color?: string; size?: string }) =>
    api.post<Cart>('/cart/items', body).then((r) => r.data),
  updateItem: (itemId: ID, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: ID) => api.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),
};

// ---- 07. Checkout & payment ----
export const checkoutApi = {
  checkout: (body: CheckoutRequest) => api.post<CheckoutResponse>('/checkout', body).then((r) => r.data),
  retryPayment: (orderGroupId: ID, paymentMethod: CheckoutRequest['paymentMethod']) =>
    api
      .post<CheckoutResponse>(`/checkout/${orderGroupId}/retry-payment`, { paymentMethod })
      .then((r) => r.data),
};

// ---- 08. Orders ----
export const ordersApi = {
  list: (status?: OrderStatus) => api.get<Paginated<Order>>('/orders', { params: { status } }).then((r) => r.data),
  get: (id: ID) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: ID, reason: string) => api.post<Order>(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  confirmDelivery: (id: ID) => api.post<Order>(`/orders/${id}/confirm-delivery`).then((r) => r.data),
};

// ---- 09. Social ----
export const socialApi = {
  favorites: (type?: FavoriteType) =>
    api.get<Favorite[]>('/social/favorites', { params: { type } }).then((r) => r.data),
  addFavorite: (type: FavoriteType, targetId: ID) =>
    api.post<Favorite>('/social/favorites', { type, targetId }).then((r) => r.data),
  removeFavorite: (type: FavoriteType, targetId: ID) =>
    api.delete<void>('/social/favorites', { params: { type, targetId } }).then((r) => r.data),

  follows: () => api.get<Follow[]>('/social/follows').then((r) => r.data),
  follow: (vendorId: ID) => api.post<Follow>('/social/follows', { vendorId }).then((r) => r.data),
  unfollow: (vendorId: ID) => api.delete<void>(`/social/follows/${vendorId}`).then((r) => r.data),

  ratings: (vendorId: ID) =>
    api.get<RatingsSummary>('/social/ratings', { params: { vendorId } }).then((r) => r.data),
  rate: (body: CreateRatingRequest) => api.post<Rating>('/social/ratings', body).then((r) => r.data),
};
