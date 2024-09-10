exports = async function(payload, response) {
  const eformDB = context.services.get("mongodb-atlas").db("eform");
  const Collection = eformDB.collection("abcCar");

  const result = await Collection.aggregate([
    {
      $lookup: {
        from: "abcCarTr",
        localField: "id",  //ฟิลด์ในคอลเลกชันหลัก (abcCar) 
        foreignField: "id", //ฟิลด์ในคอลเลกชันที่ join ที่ตรงกับ localField
        as: "trans",
      },
    },
    {
      //$unwind: "$trans"
    },
    {
      $sort: { "trans.date": -1 }
    }
  ]).toArray();

  return result;
};
