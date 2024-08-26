exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("vehicleTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "structure",
      "structureR",
      "structureP",
      "hydraulicSystem",
      "hydraulicSystemR",
      "hydraulicSystemP",
      "towingSystem",
      "towingSystemR",
      "towingSystemP",
      "fluids",
      "fluidsR",
      "fluidsP",
      "cabin",
      "cabinR",
      "cabinP",
      "brakes",
      "brakesR",
      "brakesP",
      "operationSystem",
      "operationSystemR",
      "operationSystemP",
      "warnings",
      "warningsR",
      "warningsP",
      "otherEquipment",
      "otherEquipmentR",
      "otherEquipmentP",
      "sanitation",
      "sanitationR",
      "sanitationP",
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