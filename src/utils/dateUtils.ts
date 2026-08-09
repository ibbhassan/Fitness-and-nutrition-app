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

export const getTimeUntilNextReset = () => {
  const now = new Date();
  const nextFriday = new Date(now);
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
  
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(0, 0, 0, 0);

  const diffMs = nextFriday.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${diffDays}D ${diffHours}H`;
};

