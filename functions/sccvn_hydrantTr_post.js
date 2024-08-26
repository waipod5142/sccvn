exports = async function(payload, response) {

  if (payload.body) {
      const body =  EJSON.parse(payload.body.text());
      const posts = context.services.get("mongodb-atlas").db("sccvn").collection("hydrantTr");
      
    const newPost = {
      id: body.id,
      inspector: body.inspector,
      date: new Date(),
    };

    const fieldsToInclude = [
      "generalCheck",
      "generalCheckR",
      "generalCheckP",
      "valveCheck",
      "valveCheckR",
      "valveCheckP",
      "capCheck",
      "capCheckR",
      "capCheckP",
      "hydrantHeadCheck",
      "hydrantHeadCheckR",
      "hydrantHeadCheckP",
      "inspectionTagCheck",
      "inspectionTagCheckR",
      "inspectionTagCheckP",
      "hydrantBodyCheck",
      "hydrantBodyCheckR",
      "hydrantBodyCheckP",
      "waterPressureCheck",
      "waterPressureCheckR",
      "waterPressureCheckP",
      "fireHoseCheck",
      "fireHoseCheckR",
      "fireHoseCheckP",
      "fireNozzleCheck",
      "fireNozzleCheckR",
      "fireNozzleCheckP",
      "hoseCabinetCheck",
      "hoseCabinetCheckR",
      "hoseCabinetCheckP",
      "otherChecks",
      "otherChecksR",
      "otherChecksP",
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