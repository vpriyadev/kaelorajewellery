export function normalizeSlug(slug: string | undefined | null): string {
  if (!slug) return '';
  return slug.toLowerCase().trim().replace(/\s+/g, '-');
}
