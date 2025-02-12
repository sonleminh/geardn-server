export function generateSlug(text: string) {
  return text
    .toLowerCase() // Convert to lowercase
    .normalize('NFD') // Normalize characters (handle accents)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except space and hyphen
    .trim() // Trim leading/trailing spaces
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}
