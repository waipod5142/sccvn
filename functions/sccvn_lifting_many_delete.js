exports = async function(payload, response) {
  const posts = context.services.get("mongodb-atlas").db("sccvn").collection("lifting");
  let body;

  try {
    body = JSON.parse(payload.body.text());
  } catch (e) {
    response.setStatusCode(400);
    response.setBody(JSON.stringify({ error: 'Invalid JSON payload' }));
    return;
  }

  const site = body.site; // Extract the site from the payload
  const type = body.type; // Extract the type from the payload

  // Create a filter object based on the available fields in the payload
  let filter = {};
  if (site) {
    filter.site = site;
  }
  if (type) {
    filter.type = type;
  }

  try {
    const result = await posts.deleteMany(filter);
    console.log(`Deleted ${result.deletedCount} item(s).`);
    response.setStatusCode(200);
    response.setBody(JSON.stringify({ deletedCount: result.deletedCount })); // Ensure the body is a string
  } catch (err) {
    console.error(`Delete failed with error: ${err}`);
    response.setStatusCode(500);
    response.setBody(JSON.stringify({ error: err.message })); // Ensure the body is a string
  }
};
									