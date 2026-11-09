# Riven — Website

React web version of the Riven shopper app (the Expo / React Native app in `../Frontend`).

**Stack:** React 19 · TypeScript · Vite · React Router · TanStack Query · Axios · Leaflet (OpenStreetMap)

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## API

Copy `.env.example` to `.env`:

- `VITE_API_URL` — Riven API base URL. **Leave empty to use the built-in mock backend** (`src/mocks`), which accepts any email with a password of 8+ characters.
- `VITE_USE_MOCKS=true` — force mocks even when an API URL is set.

## Structure

```
src/
  api/          client (axios + token refresh), endpoints, React Query hooks, types — shared with the mobile app
  mocks/        in-memory mock backend (same as the mobile app)
  components/   UI kit: Button, TextField, cards, Sheet, AlertHost, Layout (top bar + phone tab bar)…
  context/      AuthContext (session bootstrap, login/register/logout)
  pages/        one file per screen, grouped like the mobile app's routes
  utils/        formatting, alerts, token storage (localStorage), share / directions
  styles.css    design tokens and all styles
```

## Differences from the mobile app

| Mobile                        | Website                                              |
| ----------------------------- | ---------------------------------------------------- |
| expo-router stacks and tabs   | React Router; top nav on desktop, bottom tabs on phones |
| expo-secure-store             | localStorage                                         |
| react-native-maps             | Leaflet + OpenStreetMap (click or drag the pin)      |
| expo-location reverse geocode | Browser geolocation + OpenStreetMap Nominatim        |
| expo-image-picker             | File input (with camera capture on phones)           |
| In-app auth browser for Paymob | Full-page redirect to Paymob, returning to `/orders` |
| Share sheet                   | Web Share API, or copy link to clipboard             |
