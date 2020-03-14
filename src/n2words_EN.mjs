import Num2Word from './i18n/EN.mjs';

export default function(n) {
  return new Num2Word().toCardinal(n);
}
