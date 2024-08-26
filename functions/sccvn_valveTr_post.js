exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("valveTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "generalCheck",
      "generalCheckR",
      "generalCheckP",
      "valveLockCheck",
      "valveLockCheckR",
      "valveLockCheckP",
      "valveOperationCheck",
      "valveOperationCheckR",
      "valveOperationCheckP",
      "unusualObservation",
      "unusualObservationR",
      "unusualObservationP",
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