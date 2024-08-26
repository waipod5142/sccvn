exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("forkliftTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "loadChart",
      "loadChartR",
      "loadChartP",
      "forksAccessories",
      "forksAccessoriesR",
      "forksAccessoriesP",
      "tiresBelts",
      "tiresBeltsR",
      "tiresBeltsP",
      "mastHydraulic",
      "mastHydraulicR",
      "mastHydraulicP",
      "battery",
      "batteryR",
      "batteryP",
      "gasConnections",
      "gasConnectionsR",
      "gasConnectionsP",
      "seatBelts",
      "seatBeltsR",
      "seatBeltsP",
      "pedalsControls",
      "pedalsControlsR",
      "pedalsControlsP",
      "brakes",
      "brakesR",
      "brakesP",
      "lightsHorn",
      "lightsHornR",
      "lightsHornP",
      "damageDefects",
      "damageDefectsR",
      "damageDefectsP",
      "remark",
      "lat",
      "lng",
      "url",
    ];

    fieldsToInclude.forEach((field) => {
      if (body[field] !== undefined && body[field] !== "" && body[field] !== null && typeof body[field] !== "object") {
        newPost[field] = body[field];
      }
    });

    return await posts.insertOne(newPost);
  }

  return {};
};