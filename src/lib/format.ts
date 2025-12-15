export function formatBytes(bytes: number | null | undefined, decimals = 2) {
  if (bytes === null || bytes === undefined) return '0 Bytes';
  if (typeof bytes !== 'number' && !Number.isFinite(bytes)) return '0 Bytes';
  if (isNaN(bytes)) return '0 Bytes';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (!isFinite(i)) return '0 Bytes';

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || 'Bytes'}`;
}