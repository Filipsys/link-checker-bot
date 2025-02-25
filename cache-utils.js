import { readFile, writeFile } from "fs/promises";
import { isCacheIndexing, cachePath } from "./data/variables.js";

/**
 * @description Resets the cache file, indexes the file if config option is true.
 */
export const resetCache = async () => {
  const content = {};

  if (isCacheIndexing) {
    "abcdefghijklmnopqrstuvwxyz0123456789".split("").forEach((value) => (content[value] = {}));
  }

  await writeFile(cachePath, JSON.stringify(content)).catch((error) => console.error("Error encountered: ", error));
};

/**
 * @param {string} hash16byte
 * @description Add a hash into the json cache. If hash
 * already exists in the cache, the expiration time has
 * passed, refresh it.
 */
export const addIntoCache = async (hash16byte) => {
  const timestamp = Date.now();
  const fileContent = await readFile(cachePath).then((response) => JSON.parse(response));
  const cache = isCacheIndexing ? fileContent[hash16byte[hash16byte.length - 1]] : fileContent;

  Object.keys(cache).forEach((key) => (cache[key] === hash16byte ? delete cache[key] : null));
  cache[timestamp] = hash16byte;

  await writeFile(cachePath, JSON.stringify(fileContent)).catch((error) => new Error(error));
};

/**
 * @param {string} hash16byte
 * @returns {Error | void}
 */
export const removeFromCache = async (hash16byte) => {
  const fileContent = await readFile(cachePath).then((response) => JSON.parse(response));
  const cache = isCacheIndexing ? fileContent[hash16byte[hash16byte.length - 1]] : fileContent;

  let deleted = false;
  Object.keys(cache).forEach((key) => {
    if (cache[key] === hash16byte) {
      delete cache[key];
      deleted = true;
    }
  });

  if (!deleted) return new Error("Value does not exist in cache");

  await writeFile(cachePath, JSON.stringify(fileContent)).catch((error) => new Error(error));
};

/**
 * @param {string} hash16byte
 * @returns {boolean}
 */
export const checkInCache = async (hash16byte) => {
  const fileContent = await readFile(cachePath).then((response) => JSON.parse(response));
  const cache = isCacheIndexing ? fileContent[hash16byte[hash16byte.length - 1]] : fileContent;

  return Object.values(cache).includes(hash16byte);
};
