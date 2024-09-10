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
      $unwind: {
        path: "$trans",
        preserveNullAndEmptyArrays: true // เพิ่มเพื่อรักษาเอกสารที่ไม่มีการจับคู่
      }
    },
    {
      $sort: { "trans.date": -1 } // จัดลำดับตามวันที่ในเอกสารที่ joined
    }
  ]).toArray();

  return result;
};
