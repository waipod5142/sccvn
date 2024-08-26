exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("praTr");
      
    const newPost = {
      id: body.id,
      date: new Date(),
    };

    const fieldsToInclude = [
      "location",
      "taskDescription",
      "hazards",
      "eliminateHazard",
      "substituteHazard",
      "guardsInPlace",
      "proceduresRequired",
      "extraPPE",
      "fatigue",
      "illness",
      "rushing",
      "distraction",
      "eyesOnPath",
      "eyesOnHands",
      "lineOfFire",
      "taskSafe",
      "remark",
      "lat",
      "lng",
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