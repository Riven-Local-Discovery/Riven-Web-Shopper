import avatarDefault from '@/assets/img/avatar-default.jpg';

import type { Bazaar, BazaarLayout, Booth, Category, Order, Product, Rating, User, Vendor, VendorSummary } from '@/api/types';


const img = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

export const IMAGES = {
  market1: img('1555529669-e69e7aa0ba9a'),
  market2: img('1533900298318-6b8da08a523e'),
  market3: img('1488459716781-31db52582fe9'),
  market4: img('1519567241046-7f570eee3ce6'),
  market5: img('1528698827591-e19ccd7bc23d'),
  shirt: img('1602810318383-e386cc2a3ccf'),
  jacket: img('1620799140408-edc6dcb6d633'),
  clothes: img('1594633312681-425c7b97ccd1'),
  bag: img('1584917865442-de89df76afd3'),
  vase: img('1578500494198-246f612d3b3d'),
  ceramics: img('1565193566173-7a0ee3dbe261'),
  decor: img('1612196808214-b8e1d6145a8c'),
  candle: img('1603006905003-be475563bc59'),
  shoes: img('1543163521-1bf539c55dd2'),
  coffee: img('1506806732259-39c2d0268443'),
  food: img('1504674900247-0877df9cc836'),
  spices: img('1596040033229-a9821ebd058d'),
  beauty: img('1596462502278-27bfdc403348'),
  prints: img('1513519245088-0e12902e5a38'),
  fashion: img('1515886657613-9f3515b0c78f'),
  fashion2: img('1520006403909-838d6b92c22e'),
  mug: img('1601924994987-69e26d50dc26'),
  scarf: img('1582582621959-48d27397dc69'),
  jewelry: img('1605100804763-247f67b3557e'),
  interior: img('1524758631624-e2822e304c36'),
  art: img('1561715276-a2d087060f1d'),
  avatarSara: img('1494790108377-be9c29b29330', 300),
  avatarW2: img('1438761681033-6461ffad8d80', 300),
  avatarW3: img('1517841905240-472988babdf9', 300),
  avatarM1: img('1500648767791-00dcc994a43e', 300),
  avatarM2: img('1507003211169-0a1dd7228f2d', 300),
};

const daysFromNow = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
};

// ---------- Vendors ----------
export const vendors: Vendor[] = [
  {
    id: 'v1',
    name: 'Nour Artisans',
    tagline: 'Handmade Apparel & Linen',
    logoUrl: IMAGES.avatarW2,
    coverUrl: IMAGES.market2,
    rating: 4.8,
    reviewsCount: 124,
    about:
      'Locally spun Egyptian cotton apparel and accessories. Founded in 2021 in Cairo to revive heritage Egyptian loom weaving.',
    city: 'Cairo, Egypt',
    shipsNationwide: true,
    exchangeDays: 14,
    foundedYear: 2021,
    gallery: [IMAGES.fashion, IMAGES.clothes, IMAGES.fashion2, IMAGES.shirt],
    followersCount: 1840,
    isFollowing: true,
  },
  {
    id: 'v2',
    name: 'Heritage Crafts',
    tagline: 'Pottery & Home Decor',
    logoUrl: IMAGES.avatarM1,
    coverUrl: IMAGES.market4,
    rating: 4.6,
    reviewsCount: 86,
    about: 'Hand-thrown pottery from Fayoum artisans, glazed with natural pigments and fired in wood kilns.',
    city: 'Fayoum, Egypt',
    shipsNationwide: true,
    exchangeDays: 7,
    foundedYear: 2018,
    gallery: [IMAGES.vase, IMAGES.ceramics, IMAGES.decor, IMAGES.mug],
    followersCount: 920,
    isFollowing: false,
  },
  {
    id: 'v3',
    name: 'Siwa Botanicals',
    tagline: 'Natural Beauty & Wellness',
    logoUrl: IMAGES.avatarW3,
    coverUrl: IMAGES.market5,
    rating: 4.9,
    reviewsCount: 203,
    about: 'Cold-pressed oils, soaps and candles made in small batches with herbs from the Siwa oasis.',
    city: 'Alexandria, Egypt',
    shipsNationwide: true,
    exchangeDays: 3,
    foundedYear: 2020,
    gallery: [IMAGES.beauty, IMAGES.candle, IMAGES.spices],
    followersCount: 3120,
    isFollowing: true,
  },
  {
    id: 'v4',
    name: 'Khan Leatherworks',
    tagline: 'Leather Bags & Accessories',
    logoUrl: IMAGES.avatarM2,
    coverUrl: IMAGES.market1,
    rating: 4.5,
    reviewsCount: 58,
    about: 'Vegetable-tanned leather goods hand-stitched in the heart of Khan El Khalili.',
    city: 'Cairo, Egypt',
    shipsNationwide: false,
    exchangeDays: 14,
    foundedYear: 2015,
    gallery: [IMAGES.bag, IMAGES.shoes, IMAGES.jewelry],
    followersCount: 610,
    isFollowing: false,
  },
  {
    id: 'v5',
    name: 'Nile Roasters',
    tagline: 'Specialty Coffee & Treats',
    logoUrl: IMAGES.avatarSara,
    coverUrl: IMAGES.market3,
    rating: 4.7,
    reviewsCount: 97,
    about: 'Single-origin beans roasted weekly, plus spice blends and sweets inspired by Egyptian kitchens.',
    city: 'Giza, Egypt',
    shipsNationwide: true,
    exchangeDays: 0,
    foundedYear: 2019,
    gallery: [IMAGES.coffee, IMAGES.food, IMAGES.spices],
    followersCount: 1450,
    isFollowing: false,
  },
  {
    id: 'v6',
    name: 'Studio Maadi',
    tagline: 'Art Prints & Illustration',
    logoUrl: IMAGES.avatarW2,
    coverUrl: IMAGES.interior,
    rating: 4.4,
    reviewsCount: 41,
    about: 'Limited-run prints by independent Egyptian illustrators, printed on archival cotton paper.',
    city: 'Cairo, Egypt',
    shipsNationwide: true,
    exchangeDays: 14,
    foundedYear: 2022,
    gallery: [IMAGES.prints, IMAGES.art, IMAGES.interior],
    followersCount: 380,
    isFollowing: false,
  },
];

export const toSummary = (v: Vendor): VendorSummary => ({
  id: v.id,
  name: v.name,
  tagline: v.tagline,
  logoUrl: v.logoUrl,
  rating: v.rating,
  reviewsCount: v.reviewsCount,
});
const vs = (id: string) => toSummary(vendors.find((v) => v.id === id)!);

// ---------- Categories ----------
export const categories: Category[] = [
  { id: 'c1', name: 'Clothing', imageUrl: IMAGES.clothes, productsCount: 0 },
  { id: 'c2', name: 'Home & Living', imageUrl: IMAGES.vase, productsCount: 0 },
  { id: 'c3', name: 'Accessories', imageUrl: IMAGES.bag, productsCount: 0 },
  { id: 'c4', name: 'Art & Prints', imageUrl: IMAGES.prints, productsCount: 0 },
  { id: 'c5', name: 'Food & Beverages', imageUrl: IMAGES.coffee, productsCount: 0 },
  { id: 'c6', name: 'Beauty & Wellness', imageUrl: IMAGES.beauty, productsCount: 0 },
];

// ---------- Products ----------
type Seed = [id: string, name: string, price: number, categoryId: string, vendorId: string, images: string[], extras?: Partial<Product>];

const productSeeds: Seed[] = [
  ['p1', 'Natural Indigo Dyed Linen Shirt', 65, 'c1', 'v1', [IMAGES.shirt, IMAGES.fashion2], { colors: ['Indigo Blue', 'Sand', 'White'], sizes: ['S', 'M', 'L', 'XL'] }],
  ['p2', 'Cotton Scarf', 35, 'c3', 'v1', [IMAGES.scarf, IMAGES.fashion], { colors: ['Beige', 'Terracotta'], sizes: ['One Size'] }],
  ['p3', 'Handwoven Denim Jacket', 120, 'c1', 'v1', [IMAGES.jacket], { colors: ['Washed Blue'], sizes: ['S', 'M', 'L'] }],
  ['p4', 'Loom Cotton Dress', 95, 'c1', 'v1', [IMAGES.fashion, IMAGES.clothes], { colors: ['Olive', 'Cream'], sizes: ['S', 'M', 'L'] }],
  ['p5', 'Fayoum Clay Vase', 48, 'c2', 'v2', [IMAGES.vase], { colors: ['Natural'] }],
  ['p6', 'Glazed Ceramic Set', 72, 'c2', 'v2', [IMAGES.ceramics]],
  ['p7', 'Dried Palm Centerpiece', 38, 'c2', 'v2', [IMAGES.decor]],
  ['p8', 'Stoneware Mug', 18, 'c2', 'v2', [IMAGES.mug], { colors: ['Sand', 'Charcoal'] }],
  ['p9', 'Siwa Olive Oil Soap Set', 22, 'c6', 'v3', [IMAGES.beauty]],
  ['p10', 'Amber & Oud Candle', 28, 'c6', 'v3', [IMAGES.candle]],
  ['p11', 'Leather Tote Bag', 110, 'c3', 'v4', [IMAGES.bag], { colors: ['Tan', 'Dark Brown'] }],
  ['p12', 'Hand-stitched Loafers', 89, 'c3', 'v4', [IMAGES.shoes], { sizes: ['40', '41', '42', '43', '44'] }],
  ['p13', 'Silver Crescent Ring', 45, 'c3', 'v4', [IMAGES.jewelry], { sizes: ['6', '7', '8'] }],
  ['p14', 'Ethiopian Single-Origin Beans', 16, 'c5', 'v5', [IMAGES.coffee]],
  ['p15', 'Hawaij Spice Blend', 9, 'c5', 'v5', [IMAGES.spices]],
  ['p16', 'Old Cairo Art Print', 30, 'c4', 'v6', [IMAGES.prints], { sizes: ['A4', 'A3', 'A2'] }],
  ['p17', 'Nile Abstract Canvas', 140, 'c4', 'v6', [IMAGES.art]],
];

export const products: Product[] = productSeeds.map(([id, name, price, categoryId, vendorId, images, extras], i) => ({
  id,
  name,
  description:
    'Made in small batches by independent Egyptian makers. Every piece is inspected by hand before it ships, so small variations are part of its character.',
  price,
  currency: 'USD',
  images,
  rating: Math.round((4.2 + ((i * 7) % 8) / 10) * 10) / 10,
  reviewsCount: 12 + ((i * 37) % 180),
  categoryId,
  vendor: vs(vendorId),
  colors: [],
  sizes: [],
  stock: 3 + ((i * 5) % 20),
  isFavorite: false,
  ...extras,
}));

categories.forEach((c) => {
  c.productsCount = products.filter((p) => p.categoryId === c.id).length;
});

// ---------- Bazaars ----------
const bazaarSeeds: [string, string, string, number, number, number, string, string[], string[], number, number][] = [
  ['b1', 'Zamalek Art & Crafts Market', IMAGES.market2, 2, 4, 1.4, 'Zamalek, Cairo', ['Art', 'Handmade', 'Crafts'], ['v1', 'v2', 'v3', 'v6', 'v4'], 30.0626, 31.2197],
  ['b2', 'Cairo Creative Market', IMAGES.market1, 7, 10, 3.2, 'Downtown, Cairo', ['Design', 'Fashion'], ['v1', 'v4', 'v6'], 30.0444, 31.2357],
  ['b3', 'Maadi Weekend Makers', IMAGES.market4, 0, 1, 6.8, 'Maadi, Cairo', ['Food', 'Wellness'], ['v3', 'v5'], 29.9602, 31.2569],
  ['b4', 'Hurghada Summer Bazaar', IMAGES.market5, 20, 24, 142, 'Hurghada, Red Sea', ['Beach', 'Handmade'], ['v2', 'v3', 'v5'], 27.2579, 33.8116],
  ['b5', 'Mansoura Local Fair', IMAGES.market3, 30, 32, 117, 'Mansoura, Dakahlia', ['Local', 'Food'], ['v5', 'v2'], 31.0409, 31.3785],
];

export const bazaars: Bazaar[] = bazaarSeeds.map(([id, name, coverUrl, start, end, distanceKm, address, tags, vendorIds, lat, lng]) => ({
  id,
  name,
  tags,
  coverUrl,
  startDate: daysFromNow(start),
  endDate: daysFromNow(end),
  openTime: '10:00 AM',
  closeTime: '10:00 PM',
  address,
  city: address.split(', ').pop() ?? address,
  location: { lat, lng },
  distanceKm,
  description:
    'An open-air gathering of independent makers, designers and food vendors. Browse handmade goods, meet the artisans behind them and enjoy live music every evening.',
  status: start <= 0 ? 'live' : 'upcoming',
  vendors: vendorIds.map(vs),
  vendorsCount: vendorIds.length + 12,
  schedule: [
    { day: 'Day 1', time: '10:00 AM', title: 'Opening & makers walk' },
    { day: 'Day 1', time: '06:00 PM', title: 'Live oud performance' },
    { day: 'Day 2', time: '12:00 PM', title: 'Pottery workshop' },
    { day: 'Day 3', time: '08:00 PM', title: 'Closing night market' },
  ],
  isSaved: id === 'b1',
}));

export function buildLayout(bazaar: Bazaar): BazaarLayout {
  const booths: Booth[] = [];
  const rows = ['A', 'B', 'C', 'D'];
  rows.forEach((row, r) => {
    for (let c = 0; c < 6; c++) {
      const index = r * 6 + c;
      const vendor = bazaar.vendors[index % 4 === 0 ? (index / 4) % bazaar.vendors.length : -1];
      booths.push({
        id: `${bazaar.id}-${row}${c + 1}`,
        code: `${row}-${c + 10}`,
        x: 30 + c * 90 + (c >= 3 ? 30 : 0),
        y: 80 + r * 110 + (r >= 2 ? 40 : 0),
        width: 76,
        height: 80,
        zone: r < 2 ? 'Crafts' : 'Food & Wellness',
        vendor,
      });
    }
  });
  return {
    bazaarId: bazaar.id,
    width: 620,
    height: 620,
    booths,
    landmarks: [
      { label: 'Entrance', x: 280, y: 20, icon: 'entrance' },
      { label: 'Stage', x: 280, y: 330, icon: 'stage' },
      { label: 'Food court', x: 60, y: 580, icon: 'food' },
      { label: 'Restrooms', x: 520, y: 580, icon: 'restroom' },
    ],
  };
}

// ---------- User ----------
export const demoUser: User = {
  id: 'u1',
  fullName: 'Badawy',
  email: 'badawy@example.com',
  phone: '+20 10 1234 5678',
  avatarUrl: avatarDefault,
  interests: ['Art', 'Fashion', 'Handmade'],
  location: { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt' },
  stats: { orders: 0, favorites: 0, following: 0 },
  createdAt: '2025-01-10T10:00:00.000Z',
};

// ---------- Orders ----------
const orderFrom = (
  id: string,
  number: string,
  status: Order['status'],
  daysAgo: number,
  vendorId: string,
  lines: [productId: string, qty: number][],
): Order => {
  const items = lines.map(([pid, quantity], i) => {
    const p = products.find((x) => x.id === pid)!;
    return {
      id: `${id}-i${i}`,
      productId: p.id,
      name: p.name,
      imageUrl: p.images[0],
      quantity,
      unitPrice: p.price,
      color: p.colors[0],
      size: p.sizes[0],
    };
  });
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return {
    id,
    number,
    orderGroupId: `g-${id}`,
    status,
    createdAt: daysFromNow(-daysAgo),
    vendor: vs(vendorId),
    items,
    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping: 10,
    total: subtotal + 10,
    currency: 'USD',
    paymentMethod: 'card',
    shippingAddress: { fullName: 'Sara Ahmed', phone: '+20 10 1234 5678', city: 'Cairo', address: '12 Shagaret El Dor St, Zamalek' },
    isRated: false,
  };
};

export const orders: Order[] = [
  orderFrom('o1047', '#ORD-1047', 'delivered', 3, 'v1', [['p1', 1], ['p2', 1]]),
  orderFrom('o1046', '#ORD-1046', 'shipped', 8, 'v2', [['p5', 1], ['p8', 2]]),
  orderFrom('o1045', '#ORD-1045', 'pending', 12, 'v3', [['p9', 2], ['p10', 1]]),
  orderFrom('o1044', '#ORD-1044', 'paid', 15, 'v4', [['p11', 1]]),
];

// ---------- Ratings ----------
const authors = [
  { id: 'a1', fullName: 'Mariam K.', avatarUrl: IMAGES.avatarW3 },
  { id: 'a2', fullName: 'Omar A.', avatarUrl: IMAGES.avatarM2 },
  { id: 'a3', fullName: 'Laila H.', avatarUrl: IMAGES.avatarW2 },
  { id: 'a4', fullName: 'Youssef T.', avatarUrl: IMAGES.avatarM1 },
];
const comments = [
  'Amazing quality and fast shipping! Will definitely order again.',
  'Beautiful craftsmanship, you can tell it was made with care.',
  'Exactly like the photos. Packaging was lovely too.',
  'Great product, delivery took a little longer than expected.',
];

export const ratings: (Rating & { vendorId: string })[] = vendors.flatMap((v, vi) =>
  authors.map((author, ai) => ({
    id: `r-${v.id}-${ai}`,
    vendorId: v.id,
    rating: ai === 3 ? 4 : 5 - ((vi + ai) % 2),
    comment: comments[(vi + ai) % comments.length],
    createdAt: daysFromNow(-(ai * 6 + vi + 1)),
    author,
    productName: products.find((p) => p.vendor.id === v.id)?.name,
  })),
);
