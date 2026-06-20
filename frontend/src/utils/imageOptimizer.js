/**
 * Image optimization utilities for client-side compression before upload
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;
const MIME_TYPE = 'image/jpeg';

/**
 * Optimize an image file before upload
 * - Resizes to max 1200x1200px
 * - Compresses to JPEG at 80% quality
 * - Reduces file size significantly
 * 
 * @param {File} file - The image file to optimize
 * @returns {Promise<File>} - Optimized image file
 */
export async function optimizeImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'));
              return;
            }
            
            // Create new file from blob
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              { type: MIME_TYPE }
            );
            
            resolve(optimizedFile);
          },
          MIME_TYPE,
          QUALITY
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get the optimized image URL for display
 * Uses Cloudinary transformations for on-the-fly optimization
 * 
 * @param {string} url - Original image URL
 * @returns {string} - Optimized image URL
 */
export function getOptimizedImageUrl(url) {
  if (!url) {
    return url;
  }
  
  // If it's already a Cloudinary URL, add transformations
  if (url.includes('cloudinary.com')) {
    // Insert transformations: fit to 800px width, auto quality, auto format
    return url.replace('/upload/', '/upload/c_fit,w_800,q_auto,f_auto/');
  }
  
  return url;
}

/**
 * Validate image file before upload
 * 
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {string} - Error message or empty string if valid
 */
export function validateImageFile(file, maxSizeMB = 5) {
  if (!file) {
    return '';
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return `Image trop volumineuse (max ${maxSizeMB}MB). Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return `Format non supporté. Formats acceptés: JPG, PNG, WebP.`;
  }
  
  return '';
}