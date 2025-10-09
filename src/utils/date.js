export const oneYearFromNow = () => {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
};
export const thirtyDaysFromNow = () => {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};
export const fifteenMinutesFromNow = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};
export const ONE_DAY_MS = () => 24 * 60 * 60 * 1000;
export const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);
export const oneHoureFromNow = () => new Date(Date.now() + 60 * 60 * 1000);

export const oneWeek = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
export const oneMonth = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
export const oneYear = () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

export const oneWeekEgo = () =>
  new Date(oneWeek().getTime() - 7 * 24 * 60 * 60 * 1000);
export const oneMonthEgo = () =>
  new Date(oneMonth().getTime() - 30 * 24 * 60 * 60 * 1000);
export const oneYearEgo = () =>
  new Date(oneYear().getTime() - 365 * 24 * 60 * 60 * 1000);
