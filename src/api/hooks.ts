import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bazaarsApi,
  cartApi,
  catalogApi,
  checkoutApi,
  ordersApi,
  socialApi,
  usersApi,
  type BazaarFilter,
  type UpdateProfileBody,
} from './endpoints';
import type {
  Cart,
  CheckoutRequest,
  CreateRatingRequest,
  FavoriteType,
  GeoPoint,
  ID,
  OrderStatus,
  ProductQuery,
  User,
  UserLocation,
} from './types';

export const queryKeys = {
  me: ['me'] as const,
  discovery: (near?: GeoPoint) => ['discovery', near] as const,
  bazaars: (filter: BazaarFilter, q?: string) => ['bazaars', filter, q] as const,
  bazaar: (id: ID) => ['bazaar', id] as const,
  layout: (id: ID) => ['bazaar', id, 'layout'] as const,
  categories: ['categories'] as const,
  vendor: (id: ID) => ['vendor', id] as const,
  products: (q: ProductQuery) => ['products', q] as const,
  product: (id: ID) => ['product', id] as const,
  cart: ['cart'] as const,
  orders: (status?: OrderStatus) => ['orders', status] as const,
  order: (id: ID) => ['order', id] as const,
  favorites: (type?: FavoriteType) => ['favorites', type] as const,
  follows: ['follows'] as const,
  ratings: (vendorId: ID) => ['ratings', vendorId] as const,
};

// ---- Users ----
export const useMe = (enabled = true) => useQuery({ queryKey: queryKeys.me, queryFn: usersApi.me, enabled });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) => usersApi.update(body),
    onSuccess: (user: User) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (user: User) => qc.setQueryData(queryKeys.me, user),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserLocation) => usersApi.updateLocation(body),
    onSuccess: (user: User) => {
      qc.setQueryData(queryKeys.me, user);
      qc.invalidateQueries({ queryKey: ['discovery'] });
      qc.invalidateQueries({ queryKey: ['bazaars'] });
    },
  });
}

// ---- Discovery & bazaars ----
export const useDiscovery = (near?: GeoPoint) =>
  useQuery({ queryKey: queryKeys.discovery(near), queryFn: () => bazaarsApi.discovery(near) });

export const useBazaars = (filter: BazaarFilter, q?: string) =>
  useQuery({ queryKey: queryKeys.bazaars(filter, q), queryFn: () => bazaarsApi.list({ when: filter, q }) });

export const useBazaar = (id: ID) => useQuery({ queryKey: queryKeys.bazaar(id), queryFn: () => bazaarsApi.get(id) });

export const useBazaarLayout = (id: ID) =>
  useQuery({ queryKey: queryKeys.layout(id), queryFn: () => bazaarsApi.layout(id) });

// ---- Catalog ----
export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: catalogApi.categories });

export const useVendor = (id: ID) => useQuery({ queryKey: queryKeys.vendor(id), queryFn: () => catalogApi.vendor(id) });

export const useProducts = (query: ProductQuery, enabled = true) =>
  useQuery({ queryKey: queryKeys.products(query), queryFn: () => catalogApi.products(query), enabled });

export const useProduct = (id: ID) =>
  useQuery({ queryKey: queryKeys.product(id), queryFn: () => catalogApi.product(id) });

// ---- Cart ----
export const useCart = (enabled = true) => useQuery({ queryKey: queryKeys.cart, queryFn: cartApi.get, enabled });

function useCartMutation<TVars>(fn: (vars: TVars) => Promise<Cart>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (cart) => qc.setQueryData(queryKeys.cart, cart) });
}

export const useAddToCart = () => useCartMutation(cartApi.addItem);
export const useUpdateCartItem = () =>
  useCartMutation(({ itemId, quantity }: { itemId: ID; quantity: number }) => cartApi.updateItem(itemId, quantity));
export const useRemoveCartItem = () => useCartMutation((itemId: ID) => cartApi.removeItem(itemId));

// ---- Checkout ----
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutRequest) => checkoutApi.checkout(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useRetryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderGroupId, paymentMethod }: { orderGroupId: ID; paymentMethod: CheckoutRequest['paymentMethod'] }) =>
      checkoutApi.retryPayment(orderGroupId, paymentMethod),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// ---- Orders ----
export const useOrders = (status?: OrderStatus) =>
  useQuery({ queryKey: queryKeys.orders(status), queryFn: () => ordersApi.list(status) });

export const useOrder = (id: ID) => useQuery({ queryKey: queryKeys.order(id), queryFn: () => ordersApi.get(id) });

function useOrderMutation<TVars>(fn: (vars: TVars) => ReturnType<typeof ordersApi.get>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export const useCancelOrder = () =>
  useOrderMutation(({ id, reason }: { id: ID; reason: string }) => ordersApi.cancel(id, reason));
export const useConfirmDelivery = () => useOrderMutation((id: ID) => ordersApi.confirmDelivery(id));

// ---- Social ----
export const useFavorites = (type?: FavoriteType) =>
  useQuery({ queryKey: queryKeys.favorites(type), queryFn: () => socialApi.favorites(type) });

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, targetId, favorite }: { type: FavoriteType; targetId: ID; favorite: boolean }) =>
      favorite ? socialApi.addFavorite(type, targetId).then(() => undefined) : socialApi.removeFavorite(type, targetId),
    onSuccess: (_data, { type, targetId }) => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: queryKeys.me });
      if (type === 'product') {
        qc.invalidateQueries({ queryKey: queryKeys.product(targetId) });
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: queryKeys.cart });
      }
      if (type === 'bazaar') {
        qc.invalidateQueries({ queryKey: queryKeys.bazaar(targetId) });
        qc.invalidateQueries({ queryKey: ['bazaars'] });
      }
      qc.invalidateQueries({ queryKey: ['discovery'] });
    },
  });
}

export const useFollows = () => useQuery({ queryKey: queryKeys.follows, queryFn: socialApi.follows });

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, follow }: { vendorId: ID; follow: boolean }) =>
      follow ? socialApi.follow(vendorId).then(() => undefined) : socialApi.unfollow(vendorId),
    onSuccess: (_data, { vendorId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.vendor(vendorId) });
      qc.invalidateQueries({ queryKey: queryKeys.follows });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export const useRatings = (vendorId: ID) =>
  useQuery({ queryKey: queryKeys.ratings(vendorId), queryFn: () => socialApi.ratings(vendorId) });

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRatingRequest) => socialApi.rate(body),
    onSuccess: (_data, body) => {
      qc.invalidateQueries({ queryKey: queryKeys.ratings(body.vendorId) });
      qc.invalidateQueries({ queryKey: queryKeys.order(body.orderId) });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
