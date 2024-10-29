exports = async function(payload, response) {
  const { bu, type, site, owner, area, department, id } = payload.query || {};

  // Mapping tables based on business unit and type
  const tableMap = {
    vn: {
      lifting: ["liftingTr", "vehicle"],
      forklift: ["forkliftTr", "vehicle"],
      mobile: ["mobileTr", "vehicle"],
      vehicle: ["vehicleTr", "vehicle"],
      extinguisher: ["extinguisherTr", "extinguisher"],
      foam: ["foamTr", "extinguisher"],
      hydrant: ["hydrantTr", "extinguisher"],
      pump: ["pumpTr", "extinguisher"],
      valve: ["valveTr", "extinguisher"],
      cable: ["cableTr", "equipment"],
      cctv: ["cctvTr", "equipment"],
      equipment: ["equipmentTr", "equipment"],
      fan: ["fanTr", "equipment"],
      harness: ["harnessTr", "equipment"],
      lifeline: ["lifelineTr", "equipment"],
      lifering: ["liferingTr", "equipment"],
      lifevest: ["lifevestTr", "equipment"],
      light: ["lightTr", "equipment"],
      portable: ["portableTr", "equipment"],
      rescue: ["rescueTr", "equipment"],
      welding: ["weldingTr", "equipment"],
    },
    srb: {
      mobile: ["th_mobile", "th_daily"],
      lifting: ["th_lifting", "th_daily"],
      forklift: ["th_forklift", "th_daily"],
      vehicle: ["th_vehicle", "th_daily"],
      car: ["th_lifting", "th_daily"],
      truck: ["th_lifting", "th_daily"],
      frontend: ["th_frontend", "th_daily"],      
      crane: ["crane", "th_daily"],                  
      extinguisher: ["th_extinguisher", "th_monthly"],
      foam: ["th_foam", "th_monthly"],
      hydrant: ["th_hydrant", "th_monthly"],
      pump: ["th_pump", "th_monthly"],
      equipment: ["th_equipment", "th_quarterly"],
      machine: ["th_machine", "th_quarterly"],      
    },
  };

  const businessUnit = tableMap[bu];
  
  if (!businessUnit || !(type in businessUnit)) {
    return {
      statusCode: 400,
      body: JSON.stringify(`Invalid or unsupported business unit or type: ${bu}, ${type}`)
    };
  }

  
  const [transactionTableName, masterTableName] = businessUnit[type];  
  const dbName = !bu || bu === "vn" ? "sccvn" : bu === "srb" ? "eform" : null;
  if (!dbName) {
    return {
      statusCode: 400,
      body: JSON.stringify(`Unsupported business unit "${bu}"`)
    };
  }
    
  const db = context.services.get("mongodb-atlas").db(dbName);
  // Step 1: Query the master table to find all records matching the 'site' and 'owner'
  const masterCollection = db.collection(masterTableName);
  const filter = {
    ...(type ? { type } : {}),
    ...(site ? { site } : {}),
    ...(owner ? { owner } : {}),
    ...(area ? { area } : {}),
    ...(department ? { department } : {}),
    ...(id ? { id } : {}),    
  };

  let vehicles;
  try {
    vehicles = await masterCollection.find(filter).toArray();
    
    if (!vehicles.length) {
      return {
        statusCode: 404,
        body: JSON.stringify('No vehicles found with the specified filters')
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(`Error querying vehicle table: ${e.message}`)
    };
  }

  // Step 2: Query the transaction table for each vehicle id, sort by date (descending)
  const transactionCollection = db.collection(transactionTableName);
  for (const vehicle of vehicles) {
    const vehicleId = vehicle.id;
    try {
      const transactions = await transactionCollection.find({ id: vehicleId })
        .sort({ date: -1 })
        .limit(10)
        .toArray();
      
      vehicle.trans = transactions; // Add the transactions to the vehicle record

      // Step 3: Check for "NotPass" in the latest transaction
      if (transactions.length > 0) {
        const latestTransaction = transactions[0];
        if (Object.values(latestTransaction).includes("NotPass")) {
          vehicle.defect = "NotPass"; // Add the defect field if "NotPass" is found
        }
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify(`Error querying transaction table for vehicle ${vehicleId}: ${e.message}`)
      };
    }
  }

  // Step 4: Sort vehicles by "NotPass" first and then by latest transaction date
  vehicles.sort((a, b) => {
    // Check if "NotPass" exists in the 'defect' field
    const aHasDefect = a.defect === "NotPass" ? 1 : 0;
    const bHasDefect = b.defect === "NotPass" ? 1 : 0;
    
    // Prioritize "NotPass" defect
    if (aHasDefect > bHasDefect) {
      return -1; // a comes before b
    }
    if (aHasDefect < bHasDefect) {
      return 1; // b comes before a
    }
  
    // If neither or both have "NotPass", sort by the latest transaction date
    const aLatestDate = a.trans && a.trans[0] ? new Date(a.trans[0].date) : new Date(0);
    const bLatestDate = b.trans && b.trans[0] ? new Date(b.trans[0].date) : new Date(0);
    
    return bLatestDate - aLatestDate; // Sort in descending order of dates
  });

  // Return the sorted vehicles
  return vehicles;
};
