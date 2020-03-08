import Num2Word from './i18n/EN';

export default function(n) {
  return new Num2Word().toCardinal(n);
}
