exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("mobileTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "structuralDamage",
      "structuralDamageR",
      "structuralDamageP",
      "hydraulicSystem",
      "hydraulicSystemR",
      "hydraulicSystemP",
      "wheelsTracksTires",
      "wheelsTracksTiresR",
      "wheelsTracksTiresP",
      "accessories",
      "accessoriesR",
      "accessoriesP",
      "fluids",
      "fluidsR",
      "fluidsP",
      "cab",
      "cabR",
      "cabP",
      "loadIndicator",
      "loadIndicatorR",
      "loadIndicatorP",
      "brakeSystem",
      "brakeSystemR",
      "brakeSystemP",
      "controlSystem",
      "controlSystemR",
      "controlSystemP",
      "warnings",
      "warningsR",
      "warningsP",
      "others",
      "othersR",
      "othersP",
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