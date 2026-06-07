export const sum = (array) =>
  array.reduce((s, v) => (s += v == null ? 0 : v), 0);

export const avg = (array) =>
  array.reduce((s, v) => (s += v), 0) / array.length;
