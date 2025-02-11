import PocketBase from "pocketbase";

export const openConnection = () => {
  const pb = new PocketBase("http://127.0.0.1:8090");

  return pb;
};

export const closeConnection = () => {
  // ...
};
