exports = async function(payload, response) {
  const sccvnDB = context.services.get("mongodb-atlas").db("sccvn");
  const Collection = sccvnDB.collection("liftingTr");

  // Calculate the date one hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const pipeline = [
    { $match: { date: { $gte: oneHourAgo } } }, // Filter for dates within the last hour
    { $sort: { "date": -1 } },
    {
      $lookup: {
        from: "lifting",
        let: { liftingId: "$id" },
        pipeline: [
          { $match:
             { $expr:
                { $eq: ["$id", "$$liftingId"] }
             }
          },
          { $limit: 1 }
        ],
        as: "liftingInfo"
      }
    },
    { $unwind: "$liftingInfo" },
    { $addFields: {
        "type": "$liftingInfo.type",
        "site": "$liftingInfo.site",
        "email": "$liftingInfo.email",
      }
    },
    { $project: { "liftingInfo": 0 } },
    {
      $match: {
        $or: [
          { "horn": "NotPass" },
          { "lights": "NotPass" },
          { "isolator": "NotPass" },
          { "limitSwitch": "NotPass" },
          { "loadLimit": "NotPass" },
          { "safetyLatch": "NotPass" },
          { "loadChart": "NotPass" },
        ]
      }
    }
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};