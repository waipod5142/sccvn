exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("alertTr");
      
    const newPost = {
      id: body.id,
      alertNo: body.alertNo,
      date: new Date(),
    };

    const fieldsToInclude = [
      "typeAccident",
      "learn",
      "understand",
      "remark",
      "lat",
      "lng",
      "url"
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