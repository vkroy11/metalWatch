import { format } from 'date-fns';
import type { MetalQuote } from '../types/metals';

function inrToSpokenRupees(value: number): string {
  const rupees = Math.floor(Math.abs(value));
  const paise = Math.round((Math.abs(value) - rupees) * 100);
  const rupeesWord = `${rupees} rupee${rupees === 1 ? '' : 's'}`;
  if (paise === 0) return rupeesWord;
  return `${rupeesWord} ${paise} paise`;
}

export function buildTileA11yLabel(q: MetalQuote): string {
  const price = inrToSpokenRupees(q.price);
  const purityWord = q.symbol === 'XAU' ? `${q.purity.replace('K', ' karat')}, ` : '';
  const delta = q.delta24h;
  let deltaWord = 'change not available';
  if (delta) {
    if (delta.abs === 0) {
      deltaWord = 'unchanged';
    } else {
      const dir = delta.abs > 0 ? 'up' : 'down';
      deltaWord = `${dir} ${inrToSpokenRupees(delta.abs)}, ${Math.abs(delta.pct).toFixed(2)} percent`;
    }
  }
  const ts = q.updatedAt ? format(q.updatedAt, 'HH:mm') : 'unknown';
  return `${q.name}, ${purityWord}${price} per gram, ${deltaWord}, updated ${ts}.`;
}
