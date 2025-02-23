import { workerURL } from "./variables.js";
import "dotenv/config";

export const addIntoDB = async (hash4byte, hash8bytes, hash16bytes) => {
  try {
    const response = await fetch(workerURL, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.D1_API_KEY}`,
      },
      body: JSON.stringify({
        "4-byte": hash4byte,
        "8-byte": hash8bytes,
        "16-byte": hash16bytes,
      }),
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error inserting into database: ", error);

    return null;
  }
};

export const getFromDB = async (hash4byte) => {
  try {
    const response = await fetch(`${workerURL}/get4byte?value=${hash4byte}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.D1_API_KEY}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error fetching from database: ", error);

    return null;
  }
};
