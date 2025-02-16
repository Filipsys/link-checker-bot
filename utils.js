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
  if (url.indexOf("#") === -1) return url.slice(0, url.indexOf("#") - 1);

  return url;
};

/**
 * @param {string} url
 * @returns {string}
 * @description Returns the url with decoded percent sequences, else, returns the url.
 * @example "http://example.com/f%20o%20o" -> "http://example.com/f+o+o"
 */
export const removePercentEscapeSequences = (url) => decodeURI(url) || url;

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
  let stack = [];
  let replacedString = url;

  url.split("").forEach((char, index) => {
    if (char === ".") {
      stack.push(index);
    } else {
      if (stack.length > 1) {
        replacedString = url.slice(0, stack[0]) + url.slice(stack.length - 1, url.length - 1);
      } else {
        stack = [];
      }
    }
  });

  return replacedString;
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
  url = removeTrailingLeadingDots(url);
  url = removeConsecutiveDots(url);
  url = removeLeadingZeroesIPv6(url);

  return url;
};
