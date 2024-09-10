exports = async function(payload, response) {
  const db = context.services.get("mongodb-atlas").db("eform");

  // ดึงข้อมูลจากคอลเลคชันแรก
  const coll1 = db.collection("abcCar");
  const coll2 = db.collection("abcCarTr");

  // ดึงข้อมูลทั้งหมดจากคอลเลคชันแรก
  const data1 = await coll1.find({}).toArray();

  // ดึงข้อมูลทั้งหมดจากคอลเลคชันที่สอง
  const data2 = await coll2.find({}).toArray();

  // สร้าง set ของ ids จากข้อมูลทั้งสองชุด
  const ids1 = new Set(data1.map(item => item.id));
  const ids2 = new Set(data2.map(item => item.id));

  // หา ids ที่ตรงกัน
  const matchingIds = [...ids1].filter(id => ids2.has(id));

  // ดึงข้อมูลที่ตรงกันจากแต่ละชุดข้อมูล
  const matchingData1 = data1.filter(item => matchingIds.includes(item.id));
  const matchingData2 = data2.filter(item => matchingIds.includes(item.id));

  return {
    matchingData1,
    matchingData2
  };
};
