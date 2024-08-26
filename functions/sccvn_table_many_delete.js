exports = async function(payload, response) {
  const posts = context.services.get("mongodb-atlas").db("sccvn").collection("table");
  let body;

  try {
    body = JSON.parse(payload.body.text());
  } catch (e) {
    response.setStatusCode(400);
    response.setBody(JSON.stringify({ error: 'Invalid JSON payload' }));
    return;
  }

  const site = body.site; // Extract the site from the payload

  try {
    const result = await posts.deleteMany({ site: site });
    console.log(`Deleted ${result.deletedCount} item(s).`);
    response.setStatusCode(200);
    response.setBody(JSON.stringify({ deletedCount: result.deletedCount })); // Ensure the body is a string
  } catch (err) {
    console.error(`Delete failed with error: ${err}`);
    response.setStatusCode(500);
    response.setBody(JSON.stringify({ error: err.message })); // Ensure the body is a string
  }
};
