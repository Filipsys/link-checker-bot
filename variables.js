import { join } from "path";

export const suffixPath = join(process.cwd(), "data/suffixList.txt");
export const indexedSuffixPath = join(process.cwd(), "data/indexedSuffixList.txt");

export const urlCombinationLimit = 30;
export const URISchemes = ["file", "ftp", "http", "https", "imap", "irc", "nntp", "acap", "icap", "mtqp", "wss"];
export const unofficialURISchemes = [
  "admin",
  "app",
  "freeplane",
  "geo",
  "javascript",
  "jdbc",
  "msteams",
  "ms-access",
  "ms-excel",
  "ms-infopath",
  "ms-powerpoint",
  "ms-project",
  "ms-publisher",
  "ms-spd",
  "ms-visio",
  "ms-word",
  "odbc",
  "psns",
  "rdar",
  "s3",
  "shortcuts",
  "slack",
  "stratum",
  "trueconf",
  "viber",
  "web+",
  "zoommtg",
  "zoomus",
];
