export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE_LABEL = '5 MB';

export const validateUploadFile = (file, label = 'File') => {
  if (!file) return '';
  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    return `${label} maksimal ${MAX_UPLOAD_FILE_SIZE_LABEL}.`;
  }
  return '';
};
