exports = async function(payload, response) {
  const sccvnDB = context.services.get("mongodb-atlas").db("sccvn");
  const Collection = sccvnDB.collection("forkliftTr");

  // Calculate the date one hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const pipeline = [
    { $match: { date: { $gte: oneHourAgo } } }, // Filter for dates within the last hour
    { $sort: { "date": -1 } },
    {
      $lookup: {
        from: "vehicle",
        let: { vehicleId: "$id" },
        pipeline: [
          { $match:
             { $expr:
                { $eq: ["$id", "$$vehicleId"] }
             }
          },
          { $limit: 1 }
        ],
        as: "vehicleInfo"
      }
    },
    { $unwind: "$vehicleInfo" },
    { $addFields: {
        "type": "$vehicleInfo.type",
        "site": "$vehicleInfo.site",
        "email": "$vehicleInfo.email",
      }
    },
    { $project: { "vehicleInfo": 0 } },
    {
      $match: {
        $or: [
          { "loadChart": "NotPass" },
          { "forksAccessories": "NotPass" },
          { "tiresBelts": "NotPass" },
          { "mastHydraulic": "NotPass" },
          { "battery": "NotPass" },
          { "gasConnections": "NotPass" },
          { "seatBelts": "NotPass" },
          { "pedalsControls": "NotPass" },
          { "brakes": "NotPass" },
          { "lightsHorn": "NotPass" },
          { "damageDefects": "NotPass" },
        ]
      }
    }
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};
