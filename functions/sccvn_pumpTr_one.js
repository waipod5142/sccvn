exports = async function(payload, response) {
  
  const id = payload.query.id || ""

  const master = context.services.get("mongodb-atlas").db("sccvn").collection("extinguisher");

  const pipeline = [
    {
        $match: {
            id: id,
        },
    },
          {
              $lookup: {
                  from: "pumpTr",
                  let: {
                      id: "$id",
                  },
                  pipeline: [
                      {
                          $match: {
                              $expr: {
                                  $eq: ["$id", "$$id"],
                              },
                          },
                      },
                      {
                          $sort: {
                              date: -1,
                          },
                      },
                  ],
                  as: "trans",
              },
          },
          {
              $addFields: {
                  trans: "$trans",
              },
          },
      ]
      
      combine = await master.aggregate(pipeline).next()
      combine._id = combine._id.toString()
      
      combine.trans.forEach(item => {
        item._id = item._id.toString();
      });
  return combine
};