/**
 * Cloudinary image upload and management service
 * Replaces Firebase Storage for product image uploads
 */

export const CLOUDINARY_CONFIG = {
  cloud_name: (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || ''),
  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
};

export interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Upload image to Cloudinary using unsigned (client-side) upload preset.
 * Uses XHR to provide upload progress.
 */
export const uploadToCloudinary = (file: File, onProgress?: (percent: number) => void): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const cloudName = CLOUDINARY_CONFIG.cloud_name;
      const uploadPreset = CLOUDINARY_CONFIG.upload_preset;
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary unsigned upload configuration missing (NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET and CLOUDINARY_CLOUD_NAME)');
      }

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'products');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const percentComplete = Math.round((evt.loaded / evt.total) * 100);
        if (onProgress) onProgress(percentComplete / 100);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            resolve({ secure_url: resp.secure_url, public_id: resp.public_id });
          } catch (e) {
            reject(new Error('Invalid Cloudinary response'));
          }
        } else {
          let errMsg = `Upload failed with status ${xhr.status}`;
          try {
            const err = JSON.parse(xhr.responseText);
            errMsg = err?.error?.message || errMsg;
          } catch (_) {}
          reject(new Error(errMsg));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during image upload'));
      xhr.send(formData);
    } catch (error: any) {
      reject(error?.message ? new Error(error.message) : error);
    }
  });
};

/**
 * Delete image by public_id via server endpoint (requires API secret)
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const res = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Deletion failed');
    }
  } catch (error) {
    console.error('[Cloudinary] deletion error:', error);
    throw error;
  }
};

export const getCloudinaryImageUrl = (url: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
}): string => {
  if (!url.includes('cloudinary.com')) return url;
  const transformations = [
    options?.width && `w_${options.width}`,
    options?.height && `h_${options.height}`,
    options?.quality || 'q_auto',
    options?.format || 'f_auto',
  ]
    .filter(Boolean)
    .join(',');
  if (!transformations) return url;
  return url.replace('/image/upload/', `/image/upload/${transformations}/`);
};
