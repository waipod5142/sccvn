exports = async function(payload, response) {

  const collection = context.services.get("mongodb-atlas").db("sccvn").collection("extinguisher");
  let posts = await collection.find().toArray();

  posts.forEach(post => {
    post._id = post._id.toString();
  });

  return posts;
};