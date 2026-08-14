export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function timeAgo(iso: string): string {
  return iso;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}
