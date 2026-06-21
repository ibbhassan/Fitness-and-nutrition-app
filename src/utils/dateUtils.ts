export const getLocalDateString = (d: Date | string = new Date()) => {
  const date = new Date(d);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};
