export const getLocalDateString = (d: Date | string = new Date()) => {
  const date = new Date(d);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
};

export const getWeekString = (d: Date | string = new Date()) => {
  const date = new Date(d);
  const daysSinceFriday = (date.getDay() + 2) % 7;
  const friday = new Date(date);
  friday.setDate(date.getDate() - daysSinceFriday);
  return getLocalDateString(friday);
};
