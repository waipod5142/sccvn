exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("liftingTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "horn",
      "hornR",
      "hornP",
      "lights",
      "lightsR",
      "lightsP",
      "isolator",
      "isolatorR",
      "isolatorP",
      "limitSwitch",
      "limitSwitchR",
      "limitSwitchP",
      "loadLimit",
      "loadLimitR",
      "loadLimitP",
      "safetyLatch",
      "safetyLatchR",
      "safetyLatchP",
      "loadChart",
      "loadChartR",
      "loadChartP",
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