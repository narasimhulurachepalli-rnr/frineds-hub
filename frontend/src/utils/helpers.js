export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') || 
    filePath.startsWith('https://') || 
    filePath.startsWith('data:') || 
    filePath.startsWith('blob:')
  ) {
    return filePath;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${base}${path}`;
};
