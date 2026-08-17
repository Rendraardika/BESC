
export const normalizePhotoSrc = (src) => {
  if (!src) return '';
  const value = String(src).trim();
  if (!value || value === 'null' || value === 'undefined') return '';
  // Already a full URL or base64
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) {
    return value;
  }
  // Backend stores public files under uploads/public, and serves that folder at /uploads.
  // A stored path like "public/avatars/user_xxx.jpg" must become "/uploads/avatars/user_xxx.jpg".
  const cleanPath = value.replace(/^\/?(uploads\/)?(public\/)?/, '');
  return `/uploads/${cleanPath}`;
};

export const compressImageFile = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = (error) => reject(error);
  });
};
