/**
 * Image validation and handling utilities for product uploads
 */

export const IMAGE_CONFIG = {
  MAX_IMAGES: 3,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB in bytes
  COMPRESSION_THRESHOLD: 2 * 1024 * 1024, // 2 MB threshold for compression
  COMPRESSION_QUALITY: 0.8, // Quality level for compression (0-1)
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

/**
 * Validate a single image file
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Check file type
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG and WEBP files are supported.',
    };
  }

  // Check file extension as additional validation
  const fileName = file.name.toLowerCase();
  const hasValidExtension = IMAGE_CONFIG.ALLOWED_EXTENSIONS.some(ext =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Only JPG, PNG and WEBP files are supported.',
    };
  }

  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Image size must be under 10 MB.',
    };
  }

  return {
    valid: true,
    file,
  };
};

/**
 * Validate multiple image files
 */
export const validateImageFiles = (files: File[]): ImageValidationResult => {
  // Check max images count
  if (files.length > IMAGE_CONFIG.MAX_IMAGES) {
    return {
      valid: false,
      error: 'Maximum 3 images allowed.',
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return {
    valid: true,
  };
};

/**
 * Compress image if larger than 2 MB
 */
export const compressImageIfNeeded = async (file: File): Promise<File> => {
  // If file is smaller than compression threshold, return as is
  if (file.size <= IMAGE_CONFIG.COMPRESSION_THRESHOLD) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 1920;
        const maxHeight = 1920;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const error = new Error('Failed to get canvas context');
          console.error('[ImageCompression]', error.message);
          reject(error);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const error = new Error('Failed to compress image - blob is null');
              console.error('[ImageCompression]', error.message, { width, height });
              reject(error);
              return;
            }

            // Create a new File object from the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            console.log('[ImageCompression] Compressed:', {
              originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB',
              reduction: Math.round(((file.size - compressedFile.size) / file.size) * 100) + '%',
            });

            resolve(compressedFile);
          },
          'image/webp',
          IMAGE_CONFIG.COMPRESSION_QUALITY
        );
      };

      img.onerror = () => {
        const error = new Error('Failed to load image for compression');
        console.error('[ImageCompression]', error.message, { fileName: file.name });
        reject(error);
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      const error = new Error('Failed to read file for compression');
      console.error('[ImageCompression]', error.message, { fileName: file.name });
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Process and validate image before upload (compress if needed)
 */
export const processImageForUpload = async (file: File): Promise<{ file: File; error?: string }> => {
  // First validate
  const validationResult = validateImageFile(file);
  if (!validationResult.valid) {
    return { file, error: validationResult.error };
  }

  try {
    // Then compress if needed
    const processedFile = await compressImageIfNeeded(file);
    return { file: processedFile };
  } catch (error: any) {
    // Robust error handling
    const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : typeof error === 'object'
      ? error
      : { rawError: String(error) };

    console.error('[ImageProcessing] Error processing image:', {
      errorMessage,
      errorDetails,
      fileName: file.name,
      fileSize: file.size,
    });
    return { file, error: 'Image processing failed. Please try again.' };
  }
};

/**
 * Convert Firebase error codes to friendly user messages
 */
export const getFriendlyErrorMessage = (error: any): string => {
  // If error already has a friendly message property, return it
  if (error?.friendlyMessage) return error.friendlyMessage;

  const errorMessage = error?.message || error?.toString?.() || '';

  // If the error contains a Cloudinary response message, return it directly
  if (errorMessage) return errorMessage;

  // Fallback generic message
  return 'Image upload failed. Please try again.';
};

/**
 * Get total size of files in MB
 */
export const getFileSizeInMB = (file: File): number => {
  return Math.round((file.size / 1024 / 1024) * 100) / 100;
};
