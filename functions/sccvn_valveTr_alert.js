exports = async function(payload, response) {
  const sccvnDB = context.services.get('mongodb-atlas').db('sccvn');
  const Collection = sccvnDB.collection('valveTr');

  // Calculate the date one hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const pipeline = [
    { $match: { date: { $gte: oneHourAgo } } }, // Filter for dates within the last hour
    { $sort: { 'date': -1 } },
    {
      $lookup: {
        from: 'extinguisher',
        let: { extinguisherId: '$id' },
        pipeline: [
          { $match:
             { $expr:
                { $eq: ['$id', '$$extinguisherId'] }
             }
          },
          { $limit: 1 }
        ],
        as: 'extinguisherInfo'
      }
    },
    { $unwind: '$extinguisherInfo' },
    { $addFields: {
        'type': '$extinguisherInfo.type',
        'site': '$extinguisherInfo.site',
        'email': '$extinguisherInfo.email',
      }
    },
    { $project: { 'extinguisherInfo': 0 } },
    {
      $match: {
        $or: [
          { 'generalCheck': 'NotPass' },
          { 'valveLockCheck': 'NotPass' },
          { 'valveOperationCheck': 'NotPass' },
          { 'unusualObservation': 'NotPass' },
        ]
      }
    }
  ];

  const result = await Collection.aggregate(pipeline).toArray();

  return result;
};