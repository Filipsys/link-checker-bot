/**
 * @param {string} url
 * @returns {string}
 */
const canonicalizeURL = (url) => {
  const unwantedCharacters = [0x09, 0x0d, 0x0a];

  // Remove tab, CR and LF characters
  url = url
    .split("")
    .filter((char) => !unwantedCharacters.includes(char))
    .join("");

  // Lowercase the whole string
  url = url.toLowerCase();

  // Remove the url fragment
  if (url.indexOf("#") === -1) url = url.slice(0, url.indexOf("#") - 1);

  // Remove the percent escape sequences
  url = decodeURI(url) || url;

  // Remove all leading and trailing dots
  url = url.startsWith(".") ? url.slice(1, url.length) : url;
  url = url.endsWith(".") ? url.slice(0, url.length - 1) : url;

  // Replace all consecutive dots with a single dot
  {
    let stack = [];
    url.split("").forEach((char, index) => {
      if (char === ".") {
        stack.push(index);
      } else {
        if (stack.length > 1) {
          url = url.slice(stack[0], stack.length - 1);
        } else {
          stack = [];
        }
      }
    });
  }

  // Remove any leading zeroes and collapse zero components IPv6 addresses
  {
    if (url[0] !== "[" || url[url.length - 1] !== "]") return;

    const IPv6WithoutBrackets = url.slice(1, url.length - 2);

    let IPv6Sections = [];
    IPv6WithoutBrackets.split(":").forEach((section) => {
      while (section[0] != "0") section = section.slice(1, section.length - 1);
      IPv6Sections.push(section);
    });

    url = "[" + IPv6Sections.join(":") + "]";
  }

  return url;
};
