import type { GeoPoint } from '@/api/types';
import { showAlert } from './alert';

/** Opens turn-by-turn directions in Google Maps in a new tab. */
export function openDirections({ lat, lng }: GeoPoint) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener');
}

/** Native share sheet where the browser has one; otherwise copies the text and link. */
export async function share(text: string) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
    } catch {
      // The user closed the share sheet.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showAlert('Link copied', 'The link is on your clipboard, ready to paste.', undefined, {
      icon: 'checkmark',
      tone: 'success',
    });
  } catch {
    showAlert('Share', url);
  }
}
