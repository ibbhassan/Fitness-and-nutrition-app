export const getLocalDateString = (d: Date | string = new Date()) => {
  const date = new Date(d);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

export const getWeekString = (d: Date | string = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return getLocalDateString(monday);
};
