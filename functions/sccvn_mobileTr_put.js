exports = async function(payload, response) {

  if (payload.body) {
      const body = EJSON.parse(payload.body.text());
      const inputs = context.services.get("mongodb-atlas").db("sccvn").collection("mobileTr");

const fieldsToInclude = [
  "responder",
  "structuralDamageA",
  "structuralDamageF",
  "hydraulicSystemA",
  "hydraulicSystemF",
  "wheelsTracksTiresA",
  "wheelsTracksTiresF",
  "accessoriesA",
  "accessoriesF",
  "fluidsA",
  "fluidsF",
  "cabA",
  "cabF",
  "loadIndicatorA",
  "loadIndicatorF",
  "brakeSystemA",
  "brakeSystemF",
  "controlSystemA",
  "controlSystemF",
  "warningsA",
  "warningsF",
  "othersA",
  "othersF"
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