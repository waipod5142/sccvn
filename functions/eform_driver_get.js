exports = async function(payload, response) {
    const { bu, type, site, area, id } = payload.query || {};

    // Select database based on 'bu' parameter
    const dbName = !bu || bu === "vn" ? "sccvn" : bu === "srb" ? "eform" : null;
    if (!dbName) {
      return {
        statusCode: 400,
        body: JSON.stringify(`Unsupported business unit "${bu}"`)
      };
    }
    const db = context.services.get("mongodb-atlas").db(dbName);

    // Define collection mapping based on `bu` and `type`
    const tableMap = {
      vn: {
        lifting: ["liftingTr", "vehicle"],
        forklift: ["forkliftTr", "vehicle"],
        mobile: ["mobileTr", "vehicle"],
        vehicle: ["vehicleTr", "vehicle"],
        // Add more mappings as needed
      },
      srb: {
        car: ["th_car", "th_daily"],
        frontend: ["th_frontend", "th_daily"],
        forklift: ["th_forklift", "th_daily"],
        vehicle: ["th_vehicle", "th_daily"],        
        // Add more mappings as needed
      },
    };

    const collectionsToUse = tableMap[bu]?.[type] || [];
    if (collectionsToUse.length < 2) {
      return {
        statusCode: 400,
        body: JSON.stringify(`Unsupported type "${type}" for business unit "${bu}"`)
      };
    }

    const transactionCollections = collectionsToUse.slice(0, -1).map(col => db.collection(col));
    const equipmentCollection = db.collection(collectionsToUse[collectionsToUse.length - 1]);

    // Get current date and time in Thailand (GMT+7)
    const now = new Date();
    const thailandOffset = 7 * 60 * 60 * 1000;
    const thailandTimeNow = new Date(now.getTime() + thailandOffset);
    const todayStartThailand = new Date(thailandTimeNow);
    todayStartThailand.setHours(0, 0, 0, 0);
    const todayEndThailand = new Date(todayStartThailand);
    todayEndThailand.setHours(23, 59, 59, 999);
    const todayStartUTC = new Date(todayStartThailand.getTime() - thailandOffset);
    const todayEndUTC = new Date(todayEndThailand.getTime() - thailandOffset);

    // Aggregation pipeline
    const transactionPipeline = [
        {
            $match: {
              date: { $gte: todayStartUTC, $lt: todayEndUTC },
            },
          },
      { $sort: { date: -1 } },
      {
        $group: {
          _id: "$id",
          lastTransaction: { $first: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 1,
          lastInspectionDate: "$lastTransaction.date",
          isDefect: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $objectToArray: "$lastTransaction" },
                        as: "field",
                        cond: { $eq: ["$$field.v", "NotPass"] }
                      }
                    }
                  },
                  0
                ]
              },
              then: true,
              else: false
            }
          }
        }
      }
    ];
  
    let allInspections = [];
    for (const collection of transactionCollections) {
        const inspections = await collection.aggregate(transactionPipeline).toArray();
        allInspections = [...allInspections, ...inspections];
    }

    const inspectedVehicleMap = allInspections.reduce((acc, inspection) => {
      acc[inspection._id] = {
        lastInspectionDate: inspection.lastInspectionDate,
        isDefect: inspection.isDefect
      };
      return acc;
    }, {});

    const result = await equipmentCollection.aggregate([
      {
        $addFields: {
          inspectedCount: {
            $cond: {
              if: { $in: ["$id", Object.keys(inspectedVehicleMap)] },
              then: {
                lastInspectionDate: { $arrayElemAt: [Object.values(inspectedVehicleMap).map(item => item.lastInspectionDate), { $indexOfArray: [Object.keys(inspectedVehicleMap), "$id"] }] },
                isDefect: { $arrayElemAt: [Object.values(inspectedVehicleMap).map(item => item.isDefect), { $indexOfArray: [Object.keys(inspectedVehicleMap), "$id"] }] }
              },
              else: { lastInspectionDate: null, isDefect: false },
            },
          },
        },
      },
      {
        $group: {
          _id: { site: "$site", type: "$type" },
          totalVehicles: { $sum: 1 },
          inspectedVehicles: { $sum: { $cond: [{ $ne: ["$inspectedCount.lastInspectionDate", null] }, 1, 0] } },
          defectVehicles: { $sum: { $cond: [{ $eq: ["$inspectedCount.isDefect", true] }, 1, 0] } },
          lastInspectionDate: { $max: "$inspectedCount.lastInspectionDate" }
        },
      },
      { $sort: { "_id.site": 1, "_id.type": 1 } },
    ]).toArray();
  
    return result;
};
