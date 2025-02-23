// FILE ONLY HERE AS A BACKUP FOR THE WORKER CODE

export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url);

    const valueErrorResponse = () =>
      new Response(JSON.stringify({ error: "Value error" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });

    const valueExistsResponse = () =>
      new Response(JSON.stringify({ error: "Value already exists" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });

    const successResponse = () =>
      new Response(JSON.stringify({ status: "Success" }), {
        headers: { "Content-Type": "application/json" },
      });

    const missingValueResponse = (message = "Missing value") =>
      new Response(JSON.stringify({ error: message }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });

    if (request.method === "POST") {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${env.APIKEY}`) {
        return new Response("Unauthorized", { status: 401 });
      }

      const requestData = await request.json();

      if (!requestData["4-byte"] || !requestData["8-byte"] || !requestData["16-byte"])
        return missingValueResponse("Values needed: {'4-byte': string, '8-byte': string, '16-byte': string}");

      if (
        requestData["4-byte"].length !== 4 ||
        requestData["8-byte"].length !== 8 ||
        requestData["16-byte"].length !== 16
      )
        return valueErrorResponse();

      try {
        await env.DB.prepare("INSERT INTO `hashed-links` (`4-byte`, `8-byte`, `16-byte`) VALUES (?, ?, ?)")
          .bind(requestData["4-byte"], requestData["8-byte"], requestData["16-byte"])
          .run();

        return successResponse();
      } catch (error) {
        if (error.message.split(":")[0] == "D1_ERROR") return valueExistsResponse();

        console.error("Database insertion failed:", error.message);
        return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
      }
    }

    if (pathname === "/get4byte" && request.method === "GET") {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${env.APIKEY}`) {
        return new Response("Unauthorized", { status: 401 });
      }

      const ByteValue = searchParams.get("value");

      if (!ByteValue) return missingValueResponse();
      if (+ByteValue.length !== 4) return valueErrorResponse();

      try {
        const { results } = await env.DB.prepare("SELECT COUNT(*) as count FROM `hashed-links` WHERE `4-byte` = ?")
          .bind(ByteValue)
          .all();

        return new Response(JSON.stringify({ exists: results[0].count > 0 }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Database selection failed:", error);

        return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
      }
    }

    return new Response();
  },
};
