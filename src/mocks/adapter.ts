/**
 * In-memory mock backend implementing every endpoint in src/api/endpoints.ts.
 * Enabled automatically when VITE_API_URL is not set (see src/api/client.ts).
 * State lives in memory; reload the page to reset it.
 */
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type {
  Bazaar,
  Cart,
  CartItem,
  CheckoutRequest,
  CheckoutResponse,
  Favorite,
  FavoriteType,
  Follow,
  Order,
  Paginated,
  Product,
  ProductSort,
  User,
} from '@/api/types';
import { bazaars, buildLayout, categories, demoUser, orders, products, ratings, toSummary, vendors } from './data';

// ---------- state ----------
let user: User | null = null;
type CartLine = { id: string; productId: string; quantity: number; color?: string; size?: string };
let cart: CartLine[] = [];
const favorites = new Map<string, { id: string; type: FavoriteType; targetId: string; createdAt: string }>([
  ['product:p2', { id: 'f1', type: 'product', targetId: 'p2', createdAt: new Date().toISOString() }],
  ['bazaar:b1', { id: 'f2', type: 'bazaar', targetId: 'b1', createdAt: new Date().toISOString() }],
  ['vendor:v1', { id: 'f3', type: 'vendor', targetId: 'v1', createdAt: new Date().toISOString() }],
]);
const follows = new Set<string>(vendors.filter((v) => v.isFollowing).map((v) => v.id));
let tokenCounter = 0;
let idCounter = 2000;
const nextId = (prefix: string) => `${prefix}${++idCounter}`;

// ---------- helpers ----------
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const isFav = (type: FavoriteType, id: string) => favorites.has(`${type}:${id}`);
const withProduct = (p: Product): Product => ({ ...p, isFavorite: isFav('product', p.id) });
const withBazaar = (b: Bazaar): Bazaar => ({ ...b, isSaved: isFav('bazaar', b.id) });
const paginate = <T,>(items: T[], params: Record<string, unknown>): Paginated<T> => {
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 50);
  return { items: items.slice((page - 1) * limit, page * limit), page, limit, total: items.length };
};

function requireUser(): User {
  if (!user) throw new HttpError(401, 'Unauthorized');
  user.stats = {
    orders: orders.length,
    favorites: favorites.size,
    following: follows.size,
  };
  return user;
}

function issueTokens() {
  tokenCounter++;
  return { accessToken: `mock-access-${tokenCounter}`, refreshToken: `mock-refresh-${tokenCounter}` };
}

function buildCart(): Cart {
  const items: CartItem[] = cart.map((line) => {
    const p = products.find((x) => x.id === line.productId)!;
    return {
      ...line,
      product: { id: p.id, name: p.name, images: p.images, price: p.price, currency: p.currency, stock: p.stock, vendor: p.vendor },
      isFavorite: isFav('product', p.id),
      lineTotal: p.price * line.quantity,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const shipping = items.length ? 10 : 0;
  return {
    items,
    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: 'USD',
  };
}

function sortProducts(list: Product[], sort?: ProductSort) {
  const copy = [...list];
  if (sort === 'price_asc') copy.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') copy.sort((a, b) => b.price - a.price);
  if (sort === 'rating') copy.sort((a, b) => b.rating - a.rating);
  return copy;
}

function isWeekend(iso: string) {
  const day = new Date(iso).getDay();
  return day === 5 || day === 6;
}

// ---------- routes ----------
type Ctx = { params: Record<string, any>; body: any; match: string[] };
type Handler = (ctx: Ctx) => unknown;
const routes: [method: string, pattern: RegExp, handler: Handler][] = [];
const route = (method: string, path: string, handler: Handler) =>
  routes.push([method, new RegExp(`^${path.replace(/:\w+/g, '([^/]+)')}$`), handler]);

// 01. Auth
route('post', '/auth/register', ({ body }) => {
  if (!body.email || !body.password) throw new HttpError(400, 'Email and password are required');
  if (String(body.password).length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  user = { ...demoUser, fullName: body.fullName || demoUser.fullName, email: body.email, interests: [] };
  return { user: requireUser(), ...issueTokens() };
});
route('post', '/auth/login', ({ body }) => {
  if (!body.email || !body.password) throw new HttpError(400, 'Email and password are required');
  if (String(body.password).length < 8) throw new HttpError(401, 'Invalid email or password');
  user = { ...demoUser, email: body.email };
  return { user: requireUser(), ...issueTokens() };
});
route('post', '/auth/refresh', ({ body }) => {
  if (!String(body.refreshToken ?? '').startsWith('mock-refresh')) throw new HttpError(401, 'Invalid refresh token');
  // Tokens survive app restarts but in-memory state does not; restore the demo user.
  user ??= { ...demoUser };
  return issueTokens();
});

// 02. Users
route('get', '/users/me', () => requireUser());
route('patch', '/users/me', ({ body }) => {
  user = { ...requireUser(), ...body, avatarUrl: body.avatarUrl === null ? undefined : (body.avatarUrl ?? user?.avatarUrl) };
  return requireUser();
});
route('post', '/users/me/avatar', ({ body }) => {
  const part = body instanceof FormData ? body.get('avatar') : null;
  const uri = part instanceof Blob ? URL.createObjectURL(part) : undefined;
  if (!uri) throw new HttpError(400, 'No image received');
  // A real backend stores the file and returns its public URL; the mock keeps a local blob URL.
  user = { ...requireUser(), avatarUrl: uri };
  return requireUser();
});
route('patch', '/users/me/location', ({ body }) => {
  user = { ...requireUser(), location: body };
  return requireUser();
});
route('delete', '/users/me', ({ body }) => {
  requireUser();
  if (!body?.password || String(body.password).length < 8) throw new HttpError(403, 'Incorrect password');
  user = null;
  return undefined;
});

// 04. Discovery & bazaars
route('get', '/discovery/bazaars', () => ({
  upcoming: bazaars.filter((b) => b.status !== 'ended').slice(0, 4).map(withBazaar),
  nearby: [...bazaars].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)).slice(0, 4).map(withBazaar),
  trendingProducts: sortProducts(products, 'rating').slice(0, 6).map(withProduct),
}));
route('get', '/bazaars', ({ params }) => {
  let list = bazaars.map(withBazaar);
  if (params.when === 'upcoming') list = list.filter((b) => b.status === 'upcoming');
  if (params.when === 'weekend') list = list.filter((b) => isWeekend(b.startDate) || isWeekend(b.endDate) || b.status === 'live');
  if (params.q) list = list.filter((b) => b.name.toLowerCase().includes(String(params.q).toLowerCase()));
  return paginate(list, params);
});
route('get', '/bazaars/:id', ({ match }) => {
  const b = bazaars.find((x) => x.id === match[0]);
  if (!b) throw new HttpError(404, 'Bazaar not found');
  return withBazaar(b);
});
route('get', '/bazaars/:id/layout', ({ match }) => {
  const b = bazaars.find((x) => x.id === match[0]);
  if (!b) throw new HttpError(404, 'Bazaar not found');
  return buildLayout(b);
});

// 05. Catalog
route('get', '/categories', () => categories);
route('get', '/vendors/:id', ({ match }) => {
  const v = vendors.find((x) => x.id === match[0]);
  if (!v) throw new HttpError(404, 'Vendor not found');
  return { ...v, isFollowing: follows.has(v.id), followersCount: v.followersCount + (follows.has(v.id) ? 1 : 0) };
});
route('get', '/products', ({ params }) => {
  let list = products;
  if (params.categoryId) list = list.filter((p) => p.categoryId === params.categoryId);
  if (params.vendorId) list = list.filter((p) => p.vendor.id === params.vendorId);
  if (params.bazaarId) {
    const b = bazaars.find((x) => x.id === params.bazaarId);
    const ids = new Set(b?.vendors.map((v) => v.id));
    list = list.filter((p) => ids.has(p.vendor.id));
  }
  if (params.q) {
    const q = String(params.q).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.vendor.name.toLowerCase().includes(q));
  }
  return paginate(sortProducts(list, params.sort).map(withProduct), params);
});
route('get', '/products/:id', ({ match }) => {
  const p = products.find((x) => x.id === match[0]);
  if (!p) throw new HttpError(404, 'Product not found');
  return withProduct(p);
});

// 06. Cart
route('get', '/cart', () => (requireUser(), buildCart()));
route('post', '/cart/items', ({ body }) => {
  requireUser();
  const p = products.find((x) => x.id === body.productId);
  if (!p) throw new HttpError(404, 'Product not found');
  const existing = cart.find((l) => l.productId === body.productId && l.color === body.color && l.size === body.size);
  if (existing) existing.quantity = Math.min(p.stock, existing.quantity + (body.quantity ?? 1));
  else cart.push({ id: nextId('ci'), productId: p.id, quantity: body.quantity ?? 1, color: body.color, size: body.size });
  return buildCart();
});
route('patch', '/cart/items/:id', ({ match, body }) => {
  const line = cart.find((l) => l.id === match[0]);
  if (!line) throw new HttpError(404, 'Cart item not found');
  if (body.quantity <= 0) cart = cart.filter((l) => l.id !== line.id);
  else line.quantity = body.quantity;
  return buildCart();
});
route('delete', '/cart/items/:id', ({ match }) => {
  cart = cart.filter((l) => l.id !== match[0]);
  return buildCart();
});

// 07. Checkout
const orderGroups = new Map<string, string[]>();
route('post', '/checkout', ({ body }): CheckoutResponse => {
  requireUser();
  const req = body as CheckoutRequest;
  const current = buildCart();
  if (!current.items.length) throw new HttpError(400, 'Your cart is empty');
  const groupId = nextId('g');
  const byVendor = new Map<string, CartItem[]>();
  current.items.forEach((i) => byVendor.set(i.product.vendor.id, [...(byVendor.get(i.product.vendor.id) ?? []), i]));
  const created: Order[] = [...byVendor.entries()].map(([vendorId, items]) => {
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const id = nextId('o');
    return {
      id,
      number: `#ORD-${id.slice(1)}`,
      orderGroupId: groupId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      vendor: toSummary(vendors.find((v) => v.id === vendorId)!),
      items: items.map((i) => ({
        id: nextId('oi'),
        productId: i.product.id,
        name: i.product.name,
        imageUrl: i.product.images[0],
        quantity: i.quantity,
        unitPrice: i.product.price,
        color: i.color,
        size: i.size,
      })),
      itemsCount: items.reduce((s, i) => s + i.quantity, 0),
      subtotal,
      shipping: 10 / byVendor.size,
      total: subtotal + 10 / byVendor.size,
      currency: 'USD',
      paymentMethod: req.paymentMethod,
      shippingAddress: req.shippingAddress,
      isRated: false,
    };
  });
  orders.unshift(...created);
  orderGroups.set(groupId, created.map((o) => o.id));
  cart = [];
  const online = req.paymentMethod !== 'cash_on_delivery';
  if (online) created.forEach((o) => (o.status = 'paid')); // mock gateway always succeeds
  return {
    orderGroupId: groupId,
    orderIds: created.map((o) => o.id),
    total: current.total,
    currency: current.currency,
    paymentStatus: online ? 'pending' : 'not_required',
    paymentUrl: online ? `https://accept.paymob.com/mock/iframe?group=${groupId}` : undefined,
  };
});
route('post', '/checkout/:id/retry-payment', ({ match }): CheckoutResponse => {
  const ids = orderGroups.get(match[0]);
  if (!ids) throw new HttpError(404, 'Order group not found');
  const group = orders.filter((o) => ids.includes(o.id));
  return {
    orderGroupId: match[0],
    orderIds: ids,
    total: group.reduce((s, o) => s + o.total, 0),
    currency: 'USD',
    paymentStatus: 'pending',
    paymentUrl: `https://accept.paymob.com/mock/iframe?group=${match[0]}&retry=1`,
  };
});

// 08. Orders
const findOrder = (id: string) => {
  const o = orders.find((x) => x.id === id);
  if (!o) throw new HttpError(404, 'Order not found');
  return o;
};
route('get', '/orders', ({ params }) => {
  requireUser();
  const list = params.status ? orders.filter((o) => o.status === params.status) : orders;
  return paginate(list, params);
});
route('get', '/orders/:id', ({ match }) => findOrder(match[0]));
route('post', '/orders/:id/cancel', ({ match, body }) => {
  const o = findOrder(match[0]);
  if (!['pending', 'paid'].includes(o.status)) throw new HttpError(409, 'This order can no longer be cancelled');
  o.status = 'cancelled';
  o.cancelReason = body?.reason;
  return o;
});
route('post', '/orders/:id/confirm-delivery', ({ match }) => {
  const o = findOrder(match[0]);
  if (o.status !== 'shipped') throw new HttpError(409, 'Only shipped orders can be confirmed');
  o.status = 'delivered';
  return o;
});

// 09. Social
function resolveFavorite(f: { id: string; type: FavoriteType; targetId: string; createdAt: string }): Favorite | null {
  if (f.type === 'product') {
    const p = products.find((x) => x.id === f.targetId);
    return p ? { id: f.id, type: 'product', createdAt: f.createdAt, product: withProduct(p) } : null;
  }
  if (f.type === 'vendor') {
    const v = vendors.find((x) => x.id === f.targetId);
    return v ? { id: f.id, type: 'vendor', createdAt: f.createdAt, vendor: toSummary(v) } : null;
  }
  const b = bazaars.find((x) => x.id === f.targetId);
  return b ? { id: f.id, type: 'bazaar', createdAt: f.createdAt, bazaar: withBazaar(b) } : null;
}
route('get', '/social/favorites', ({ params }) =>
  [...favorites.values()]
    .filter((f) => !params.type || f.type === params.type)
    .map(resolveFavorite)
    .filter(Boolean),
);
route('post', '/social/favorites', ({ body }) => {
  const entry = { id: nextId('f'), type: body.type, targetId: body.targetId, createdAt: new Date().toISOString() };
  favorites.set(`${body.type}:${body.targetId}`, entry);
  return resolveFavorite(entry);
});
route('delete', '/social/favorites', ({ params }) => {
  favorites.delete(`${params.type}:${params.targetId}`);
  return undefined;
});
route('get', '/social/follows', (): Follow[] =>
  vendors
    .filter((v) => follows.has(v.id))
    .map((v) => ({ id: `fl-${v.id}`, createdAt: new Date().toISOString(), vendor: { ...toSummary(v), followersCount: v.followersCount } })),
);
route('post', '/social/follows', ({ body }) => {
  follows.add(body.vendorId);
  const v = vendors.find((x) => x.id === body.vendorId)!;
  return { id: `fl-${v.id}`, createdAt: new Date().toISOString(), vendor: { ...toSummary(v), followersCount: v.followersCount } };
});
route('delete', '/social/follows/:vendorId', ({ match }) => {
  follows.delete(match[0]);
  return undefined;
});
route('get', '/social/ratings', ({ params }) => {
  const list = ratings.filter((r) => !params.vendorId || r.vendorId === params.vendorId);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  list.forEach((r) => distribution[r.rating as 1 | 2 | 3 | 4 | 5]++);
  const average = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return {
    average: Math.round(average * 10) / 10,
    count: list.length,
    distribution,
    items: [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
});
route('post', '/social/ratings', ({ body }) => {
  const u = requireUser();
  const o = findOrder(body.orderId);
  if (o.status !== 'delivered') throw new HttpError(409, 'You can rate an order after it is delivered');
  o.isRated = true;
  const rating = {
    id: nextId('r'),
    vendorId: body.vendorId,
    rating: body.rating,
    comment: body.comment,
    createdAt: new Date().toISOString(),
    author: { id: u.id, fullName: u.fullName, avatarUrl: u.avatarUrl },
    productName: o.items[0]?.name,
  };
  ratings.unshift(rating);
  return rating;
});

// ---------- adapter ----------
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await delay(250 + Math.random() * 250);
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : (config.data ?? {});
  const params = Object.fromEntries(Object.entries(config.params ?? {}).filter(([, v]) => v !== undefined && v !== ''));

  const respond = (status: number, data: unknown): AxiosResponse => ({
    data,
    status,
    statusText: String(status),
    headers: new AxiosHeaders(),
    config,
  });

  for (const [m, pattern, handler] of routes) {
    const match = path.match(pattern);
    if (m !== method || !match) continue;
    try {
      const data = handler({ params, body, match: match.slice(1) });
      return respond(data === undefined ? 204 : 200, data);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      const message = e instanceof Error ? e.message : 'Mock server error';
      const response = respond(status, { message, statusCode: status });
      throw new AxiosError(message, String(status), config, undefined, response);
    }
  }
  throw new AxiosError(`Mock route not found: ${method.toUpperCase()} ${path}`, '404', config, undefined, respond(404, { message: 'Not found' }));
};
