// Dates are plain YYYY-MM-DD; format in UTC so they don't shift a day in negative-offset timezones.
const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const numFmt = new Intl.NumberFormat("en-US");
const deltaFmt = new Intl.NumberFormat("en-US", { signDisplay: "always" });

export const formatDate = (d: string) => dateFmt.format(new Date(d));
export const formatKm = (n: number) => `${numFmt.format(n)} km`;
export const formatKmDelta = (n: number) => `${deltaFmt.format(n)} km`;
