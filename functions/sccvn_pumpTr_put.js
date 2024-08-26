exports = async function(payload, response) {

  if (payload.body) {
      const body = EJSON.parse(payload.body.text());
      const inputs = context.services.get("mongodb-atlas").db("sccvn").collection("pumpTr");

    const fieldsToInclude = [
      "responder",
      "generalCheckA",
      "generalCheckF",
      "engineCheckA",
      "engineCheckF",
      "operationCheckA",
      "operationCheckF",
      "unusualObservationA",
      "unusualObservationF",
    ];
      const updateFields = {};

      fieldsToInclude.forEach((field) => {
        if (body[field] !== undefined && body[field] !== "" && body[field] !== null && typeof body[field] !== "object") {
          updateFields[field] = body[field];
        }
      });

      const updateResponse = await inputs.updateOne(
        { _id: BSON.ObjectId(body._id) },
        { $set: updateFields }
      );

      return updateResponse;
  }

  return {};
};