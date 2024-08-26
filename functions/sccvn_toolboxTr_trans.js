exports = async function(payload, response) {
  const sccvnDB = context.services.get("mongodb-atlas").db("sccvn");
  const Collection = sccvnDB.collection("toolboxTr");

  // Get today's date at midnight and adjust for timezone offset
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  todayStart.setHours(todayStart.getHours() - 7);

  const pipeline = [
    // Match records where the date is greater than or equal to todayStart
    { $match: { "date": { $gte: todayStart } } },
    { $sort: { "date": -1 } },
    {
      $lookup: {
        from: "man",
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
    { $unwind: "$personInfo" }, // Unwind the result to avoid nested array
    { $addFields: {
        "name": "$personInfo.name",
        "position": "$personInfo.position",  // Add position field
        "department": "$personInfo.department"  // Add department field
      }
    }, 
    { $project: { "personInfo": 0 } } // Optionally remove the "personInfo" field if not needed
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};
