import { writeFile, readFile } from "fs/promises";
import { URISchemes, unofficialURISchemes, suffixPath, indexedSuffixPath } from "./variables.js";

/**
 * @param {string} url
 * @returns {{
 *   "4bit": string,
 *   "8bit": string,
 *   "16bit": string
 * }}
 * @description Returns the hashed first 4-bit, 8-bit & 16-bit values using SHA-256.
 */
export const hashURL = async (url) => {
  const utf8encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8encoder.encode(url));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  console.log(hash);

  return {
    "4bit": hash.slice(-4),
    "8bit": hash.slice(-8),
    "16bit": hash.slice(-16),
  };
};

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
export const URLCombinations = async (url) => {
  const urlCombinations = [];
  const urlParts = {
    isIPv4: false,
    URIScheme: "",
    hostSuffixes: [],
    hostTLD: "",
    eTLD: "",
    pathPrefixes: [],
  };

  const urlWithoutScheme = url.split(urlParts.URIScheme + "://")[1];
  const urlWithoutPaths = urlWithoutScheme.split("/")[0];

  // Check if URL is an IPv4
  const IPv4Check = urlWithoutPaths.search(/\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3}/g);
  if (IPv4Check !== -1) {
    urlParts.isIPv4 = true;
    urlParts.hostTLD = urlWithoutPaths.slice(-IPv4Check);
  }

  const urlSuffixList = urlWithoutPaths.split(".");

  // Check for URI schemes
  URISchemes.forEach((scheme) => {
    if (url.includes(scheme + "://")) urlParts.URIScheme = scheme;
  });

  unofficialURISchemes.forEach((scheme) => {
    if (url.includes(scheme + "://")) urlParts.URIScheme = scheme;
  });

  // Get the eTLD
  if (!urlParts.isIPv4) {
    const fileContent = await readFile(indexedSuffixPath).then((response) => JSON.parse(response));
    const desiredIndexList = fileContent[urlWithoutPaths[urlWithoutPaths.length - 1]];

    for (let i = 0; i < urlSuffixList.length; i++) {
      let suffixCheck = "";

      for (let j = i; j < urlSuffixList.length; j++) {
        suffixCheck += urlSuffixList[j] + (j < urlSuffixList.length - 1 ? "." : "");
      }

      if (desiredIndexList.includes(suffixCheck)) {
        urlParts.eTLD = suffixCheck;
        break;
      }
    }
  }

  // Get the host TLD (domain)
  const hostTLDLocation = urlSuffixList.length - 1 - urlParts.eTLD.split(".").length;
  if (!urlParts.isIPv4) urlParts.hostTLD = urlSuffixList[hostTLDLocation];

  // Add the path prefixes
  const urlPaths = urlWithoutScheme.split("/").slice(1);
  urlPaths.forEach((prefix) => (urlParts.pathPrefixes = [...urlParts.pathPrefixes, prefix]));

  // Add the host suffixes
  if (!urlParts.isIPv4) urlParts.hostSuffixes = urlWithoutScheme.split(".").slice(0, hostTLDLocation);

  // Create URL combinations
  for (let suffixIndex = urlParts.hostSuffixes.length; suffixIndex >= 0; suffixIndex--) {
    let combination = "";

    combination += urlParts.hostSuffixes.slice(0, suffixIndex).join(".");
    if (combination && !urlParts.isIPv4) combination += ".";

    combination += `${urlParts.hostTLD}${!urlParts.isIPv4 ? `.${urlParts.eTLD}` : ""}`;

    for (let pathIndex = urlParts.pathPrefixes.length; pathIndex >= 0; pathIndex--) {
      let pathCombination = urlParts.pathPrefixes.slice(0, pathIndex).join("/");
      let finalCombination = combination + (pathCombination ? `/${pathCombination}` : "");

      urlCombinations.push(finalCombination);
    }
  }

  console.log(urlParts);
  console.log(urlCombinations);

  return url;
};

export const saveLatestPublicSuffixList = async () => {
  fetch("https://publicsuffix.org/list/public_suffix_list.dat")
    .then(async (response) => response.text())
    .then(async (response) => {
      await writeFile(suffixPath, response);

      await formatSavedList();
      await indexSavedList();
    })
    .catch((error) => console.error("Error encountered: ", error));
};

export const formatSavedList = async () => {
  const contents = await readFile(suffixPath, { encoding: "utf-8" });
  const lettersCodeMin = 97;
  const lettersCodeMax = 122;

  const formattedContent = contents
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("/") &&
        line.trim() !== "" &&
        line.split("").every((char) => {
          return (
            (char.charCodeAt() >= lettersCodeMin && char.charCodeAt() <= lettersCodeMax) || char.charCodeAt() === 46
          );
        })
    )
    .join("\n");

  await writeFile(suffixPath, formattedContent).catch((error) => console.log("Error encountered: ", error));
};

export const indexSavedList = async () => {
  const contents = await readFile(suffixPath, { encoding: "utf-8" });

  const indexedResults = {};
  "abcdefghijklmnopqrstuvwxyz".split("").forEach((value) => (indexedResults[value] = []));

  contents.split("\n").forEach((suffix) => {
    const lastSuffix = suffix[suffix.length - 1];

    indexedResults[lastSuffix] = [...indexedResults[lastSuffix], suffix];
  });

  await writeFile(indexedSuffixPath, JSON.stringify(indexedResults)).catch((error) =>
    console.log("Error encountered: ", error)
  );
};
