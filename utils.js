import { writeFile, readFile } from "fs/promises";
import { join } from "path";

const suffixPath = join(process.cwd(), "data/suffixList.txt");

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with removed tabs, CR and LF characters.
 */
export const removeEscapeCharacters = (url) => {
  const unwantedCharacters = [0x09, 0x0d, 0x0a];

  return url
    .split("")
    .filter((char) => !unwantedCharacters.includes(parseInt(`0x${char.charCodeAt(0).toString(16).padStart(2, 0)}`, 16)))
    .join("");
};

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with the removed fragment, else, returns the url.
 */
export const removeURLFragment = (url) => {
  if (url.indexOf("#") === -1) return url;

  return url.slice(0, url.indexOf("#"));
};

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with decoded percent sequences, else, returns the url.
 * @example "http://example.com/f%20o%20o" -> "http://example.com/f+o+o"
 */
export const removePercentEscapeSequences = (url) => decodeURI(url).replaceAll(" ", "+") || url;

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with removed trailing and leading dots.
 */
export const removeTrailingLeadingDots = (url) => {
  url = url.startsWith(".") ? url.slice(1, url.length) : url;
  url = url.endsWith(".") ? url.slice(0, url.length - 1) : url;

  return url;
};

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with all consecutive dots replaced with single dots.
 */
export const removeConsecutiveDots = (url) => {
  let dotChain = 0;
  let dotChainIndex = null;

  url.split("").forEach((char, index) => {
    if (char === ".") {
      if (dotChainIndex === null) dotChainIndex = index;
      dotChain++;
    } else {
      url = url.slice(0, dotChainIndex) + url.slice(dotChainIndex + dotChain, url.length);

      dotChain = 0;
      dotChainIndex = null;
    }
  });

  return url;
};

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with any leading zeroes and collapse zero components removed from the IPv6 address, if existing.
 */
export const removeLeadingZeroesIPv6 = (url) => {
  if (url[0] !== "[" || url[url.length - 1] !== "]") return url;

  let IPv6Sections = [];
  url
    .slice(1, url.length - 2)
    .split(":")
    .forEach((section) => {
      while (section[0] != "0") section = section.slice(1, section.length - 1);
      IPv6Sections.push(section);
    });

  return "[" + IPv6Sections.join(":") + "]";
};

/**
 * @param {string} url
 * @returns {string}
 */
export const canonicalizeURL = (url) => {
  url = url.toLowerCase();
  url = removeEscapeCharacters(url);
  url = removeURLFragment(url);
  url = removePercentEscapeSequences(url);
  url = removeConsecutiveDots(url);
  url = removeTrailingLeadingDots(url);
  url = removeLeadingZeroesIPv6(url);

  return url;
};

/**
 * @param {string} url
 * @returns {string[]}
 */
export const URLCombinations = (url) => {
  const URISchemes = ["file", "ftp", "http", "https", "imap", "irc", "nntp", "acap", "icap", "mtqp", "wss"];
  const unofficialURISchemes = [
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
  const urlCombinationLimit = 30;
  const urlParts = [];

  return url;
};

export const saveLatestPublicSuffixList = async () => {
  fetch("https://publicsuffix.org/list/public_suffix_list.dat")
    .then(async (response) => response.text())
    .then(async (response) => {
      await writeFile(suffixPath, response);
    })
    .catch((error) => console.error("Error encountered: ", error));
};

export const formatSavedList = async () => {
  const contents = await readFile(suffixPath, { encoding: "utf-8" });

  const formattedContent = contents
    .split("\n")
    .filter((line) => !line.startsWith("/") && line.trim() !== "")
    .join("\n");

  await writeFile(suffixPath, formattedContent).catch((error) => console.log("Error encountered: ", error));
};
