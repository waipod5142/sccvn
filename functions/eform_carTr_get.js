exports = async function(payload, response) {
  const db = context.services.get("mongodb-atlas").db("eform");

  // ดึงข้อมูลจากคอลเลคชันแรก
  const collection1 = db.collection("abcCar");
  const collection2 = db.collection("abcCarTr");

  // ตรวจสอบพารามิเตอร์ ID
  if (!payload.query || !payload.query.id) {
    return { error: "ID is missing from the query" };
  }

  const id = payload.query.id;

  // ดึงข้อมูลจาก collection1 ตาม ID
  const data1 = await collection1.findOne({ _id: id });

  // ดึงข้อมูลจาก collection2 ตาม ID
  const data2 = await collection2.findOne({ _id: id });

  // ตรวจสอบว่าข้อมูลที่ดึงมาทั้งสองชุดไม่เป็น null
  if (!data1 || !data2) {
    return { error: "Data not found for the given ID" };
  }

  // รวมข้อมูลจาก data1 และ data2
  const dataAll = {
    _id: id,
    ...data1, // ข้อมูลจาก collection1
    ...data2 // ข้อมูลจาก collection2
  };

  // ส่งผลลัพธ์ที่รวมกันกลับ
  return dataAll;
};