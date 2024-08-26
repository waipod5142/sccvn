exports = async function(payload, response) {
  const sccvnDB = context.services.get("mongodb-atlas").db("sccvn");
  const Collection = sccvnDB.collection("liftingTr"); // transaction

  const pipeline = [
    { $sort: { "date": -1 } },
    {
      $lookup: {
        from: "lifting",
        let: { personId: "$id" },
        pipeline: [
          { $match:
             { $expr:
                { $eq: ["$id", "$$personId"] }
             }
          },
          { $limit: 1 }
        ],
        as: "personInfo"
      }
    },
    { $unwind: { path: "$personInfo", preserveNullAndEmptyArrays: true } }, // Allow missing personInfo
    { $addFields: {
        "location": "$personInfo._id"
      }
    },
    { $project: { "personInfo": 0 } } // Optionally remove the "personInfo" field if not needed
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};
