exports = async function(payload) {
 const mongodb = context.services.get("mongodb-atlas");
 const eventsdb = mongodb.db("sccvn");
 const eventscoll = eventsdb.collection("lifting");
 const result= await eventscoll.insertOne(payload.query);
 var id = result.insertedId.toString();
 if(result) {
 return JSON.stringify(id,false,false);
 }
 return { text: `Error saving` };
};