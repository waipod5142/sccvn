exports = async function(payload, response) {
  
  const site = payload.query.site;

  const sccvnDB = context.services.get("mongodb-atlas").db("sccvn");
  const Collection = sccvnDB.collection("vehicle");

  const pipeline = [
    {
      $match: {
        "type": "mobile",
        ...(site ? { "site": site } : {}) // Add site match only if site is defined and not empty
      }
    },
    {
      $lookup: {
        from: "mobileTr",
        let: { id: "$id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$id", "$$id"],
              }
            }
          },
          {
            $sort: { "date": -1 }
          }
        ],
        as: "trans",
      },
    }
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};
