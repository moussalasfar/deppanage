export function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

// French keeps the singular for 0 as well as 1: « 0 demande », « 1 demande ».
export function plural(n, singular, suffix = 's') {
  return n < 2 ? singular : singular + suffix;
}
