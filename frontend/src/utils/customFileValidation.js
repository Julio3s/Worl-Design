export const MAX_CUSTOM_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_CUSTOM_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'svg'];

export function validateCustomFile(file) {
  if (!file) {
    return '';
  }

  if (file.size > MAX_CUSTOM_FILE_SIZE) {
    return 'Fichier trop volumineux (max 10 MB).';
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_CUSTOM_FILE_EXTENSIONS.includes(extension)) {
    return `Format non autorise. Formats acceptes: ${ALLOWED_CUSTOM_FILE_EXTENSIONS.join(', ')}.`;
  }

  return '';
}
