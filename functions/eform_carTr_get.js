exports = async function(payload, response) {
  const eformDB = context.services.get("mongodb-atlas").db("eform");
  const collection = eformDB.collection("abcCar");
  const currentDate = new Date();
  const year = payload.query.y ? parseInt(payload.query.y, 10) : currentDate.getFullYear();
  const month = payload.query.m ? parseInt(payload.query.m, 10): currentDate.getMonth(); // เดือนใน JavaScript เริ่มที่ 0
  const day = payload.query.d ? parseInt(payload.query.d, 10) : null;
  const type = payload.query.type || null;
  const id = payload.query.id || null;

  // สร้างเงื่อนไขการค้นหาตามพารามิเตอร์ที่ได้รับ
  const query = {
    ...(id && { id: { $regex: new RegExp(id, "i") } }),
    ...(type && { type: { $regex: new RegExp(type, "i") } }),
    ...(day !== null && {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
          { $eq: [{ $dayOfMonth: "$date" }, day] }
        ]
      }
    }),
    ...(month !== null && day === null && {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] }
        ]
      }
    })
  };

  // หากไม่มีพารามิเตอร์ใด ๆ กำหนดให้แสดงข้อมูลทั้งหมดในเดือนปีปัจจุบัน
  if (Object.keys(payload.query || {}).length === 0) {
    query.date = {
      $gte: new Date(year, month, 1),
      $lt: new Date(year, month + 1, 1)
    };
  }

  // ดีบัก: แสดงเงื่อนไขการค้นหา
  console.log('Query:', JSON.stringify(query, null, 2));

  // ดึงข้อมูลตามเงื่อนไข
  const result = await collection.aggregate([
    {
      $lookup: {
        from: "abcCarTr",
        localField: "id",
        foreignField: "id",
        as: "trans",
      },
    },
    {
      $unwind: {
        path: "$trans",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: query
    },
    {
      $sort: { "trans.date": -1 }
    }
  ]).toArray();

  return result;
};
