exports = async function(payload, response) {
  const tag = payload.query.tag || "";

  const db = context.services.get("mongodb-atlas").db("sccvn");

  const harnessCollection = db.collection("harnessTr");
  const portableCollection = db.collection("portableTr");
  const lifelineCollection = db.collection("lifelineTr");

  // Function to get the latest transaction by id and then match the tag
  const getLastTransactionById = async (collection, tag) => {
    const results = await collection
      .aggregate([
        {
          $group: {
            _id: "$id", // Group by id
            latestTransaction: { $max: "$$ROOT" }, // Get the latest document by date
          },
        },
        {
          $replaceRoot: { newRoot: "$latestTransaction" }, // Replace the root with the latest transaction
        },
        { $match: { tag: tag } }, // Filter by tag after grouping and finding the latest
      ])
      .toArray();

    return results;
  };

  // Get the latest transaction for each collection by id
  const harnessResults = await getLastTransactionById(harnessCollection, tag);
  const portableResults = await getLastTransactionById(portableCollection, tag);
  const lifelineResults = await getLastTransactionById(lifelineCollection, tag);

  // Add the collection name as a field in each object
  harnessResults.forEach(result => result.collection = "Harness");
  portableResults.forEach(result => result.collection = "Portable");
  lifelineResults.forEach(result => result.collection = "Lifeline");

  // Merge the results into a single array
  const allResults = [...harnessResults, ...portableResults, ...lifelineResults];

  // Convert the array to a JSON string
  const resultString = JSON.stringify(allResults);

  // Return the results as a JSON string
  response.setBody(resultString);
};
