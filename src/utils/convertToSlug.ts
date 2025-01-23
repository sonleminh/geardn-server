export function convertToSlug(text) {
  return text
    .toLowerCase() // Convert to lowercase
    .normalize('NFD') // Decompose characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove any non-alphanumeric characters or hyphens
}
