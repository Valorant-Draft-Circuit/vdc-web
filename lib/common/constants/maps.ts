export const MAPS = {
  ASCENT: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
  SPLIT: "d960549e-485c-e861-8d71-aa9d1aed12a2",
  FRACTURE: "b529448b-4d60-346e-e89e-00a4c527a405",
  BIND: "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
  BREEZE: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
  ABYSS: "224b0a95-48b9-f703-1bd8-67aca101a61f",
  LOTUS: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
  SUNSET: "92584fbe-486a-b1b2-9faa-39b0f486b498",
  PEARL: "fd267378-4d1d-484f-ff52-77821ed10dc2",
  ICEBOX: "e2ad5c54-4114-a870-9641-8ea21279579a",
  CORRODE: "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
  HAVEN: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
  SUMMIT: "756da597-416b-c0f2-f47b-afbdf28670bc",
};

export const MAP_LIST_URL = (UUID) => {
  return `https://media.valorant-api.com/maps/${UUID}/splash.png`;
};

export const SECONDARY_MAP_LIST_URL = (UUID) => {
  return `https://media.valorant-api.com/maps/${UUID}/premierbackgroundimage.png`;
};
