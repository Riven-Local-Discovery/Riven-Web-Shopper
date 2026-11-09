import type { IconName } from '@/components/Icon';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  icon?: IconName;
  tone?: 'brand' | 'success' | 'danger';
}

export interface AlertRequest extends AlertOptions {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
}

// Tiny external store so `showAlert` can be called from anywhere (mutation callbacks, plain functions)
// while <AlertHost /> at the app root renders the themed dialog.
let queue: AlertRequest[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const alertStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  current: (): AlertRequest | undefined => queue[0],
  dismiss(id: number) {
    queue = queue.filter((a) => a.id !== id);
    emit();
  },
};

/** Shows a themed dialog. Without buttons it shows a single "OK". */
export function showAlert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
  queue = [...queue, { id: nextId++, title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }], ...options }];
  emit();
}
