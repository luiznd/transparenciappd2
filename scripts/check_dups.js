// Verifica duplicatas por (portal, referencia) e valida _id numérico sequencial
use("portalDB");

const dups = db.portals.aggregate([
  { $group: { _id: { portal: "$portal", referencia: "$referencia" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();

const nonNumeric = db.portals.countDocuments({ _id: { $regex: /[^0-9]/ } });

const stats = db.portals.aggregate([
  { $addFields: { idNum: { $toInt: "$_id" } } },
  { $group: { _id: null, minId: { $min: "$idNum" }, maxId: { $max: "$idNum" }, ids: { $addToSet: "$idNum" } } },
  { $project: { minId: 1, maxId: 1, count: { $size: "$ids" }, expected: { $add: [ { $subtract: ["$maxId", "$minId"] }, 1 ] } } }
]).toArray();

printjson({ dups, nonNumeric, stats });