exports = async function(payload, response) {

  const id = payload.query.id || ""

  const posts= context.services.get("mongodb-atlas").db("sccvn").collection("hydrantTr");
  
  const deleteResponse = await posts.deleteOne({
    _id: BSON.ObjectId(payload.query.id)
  })

  return deleteResponse
    
};