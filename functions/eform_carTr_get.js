exports = async function(payload, response) {
  const eformDB = context.services.get("mongodb-atlas").db("eform");
  const Collection = eformDB.collection("abcCar");

  // ดึงค่าพารามิเตอร์จาก payload
  const id = payload.query && payload.query.id ? payload.query.id : null;
  const month = payload.query && payload.query.m ? parseInt(payload.query.m, 10) : null;
  const day = payload.query && payload.query.d ? parseInt(payload.query.d, 10) : null;
  const type = payload.query && payload.query.type ? payload.query.type : null;

  // สร้างเงื่อนไขการค้นหา
  let matchStage = {};
  
  if (id) {
    matchStage.id = id;
  }
  if (type) {
    matchStage.type = type;
  }

  const pipeline = [
    {
      $match: matchStage
    },
    {
      $lookup: {
        from: "abcCarTr",
        localField: "id",  // ฟิลด์ในคอลเลกชันหลัก (abcCar)
        foreignField: "id", // ฟิลด์ในคอลเลกชันที่ join ที่ตรงกับ localField
        as: "trans",
      }
    },
    {
      $unwind: {
        path: "$trans",
        preserveNullAndEmptyArrays: true // เพิ่มเพื่อรักษาเอกสารที่ไม่มีการจับคู่
      }
    },
    {
      $addFields: {
        "trans.date": {
          $dateFromString: {
            dateString: "$trans.date"
          }
        }
      }
    },
    {
      $match: {
        $expr: {
          $and: [
            month !== null ? { $eq: [{ $month: "$trans.date" }, month] } : { $expr: { $gt: -1, $lt: 13 } }, // กรองเดือน
            day !== null ? { $eq: [{ $dayOfMonth: "$trans.date" }, day] } : { $expr: { $gt: -1, $lt: 32 } } // กรองวัน
          ]
        }
      }
    },
    {
      $sort: { "trans.date": -1 } // จัดลำดับตามวันที่ในเอกสารที่ joined
    }
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};
