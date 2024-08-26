exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("extinguisherTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "sealCheck",
      "sealCheckR",
      "sealCheckP",
      "mouthRustCheck",
      "mouthRustCheckR",
      "mouthRustCheckP",
      "hoseCheck",
      "hoseCheckR",
      "hoseCheckP",
      "cleaning",
      "cleaningR",
      "cleaningP",
      "gasLevelCheck",
      "gasLevelCheckR",
      "gasLevelCheckP",
      "powderShake",
      "powderShakeR",
      "powderShakeP",
      "pressureGaugeCheck",
      "pressureGaugeCheckR",
      "pressureGaugeCheckP",
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