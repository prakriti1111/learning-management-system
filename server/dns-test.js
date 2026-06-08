const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.lms-db.xj5nti8.mongodb.net",
  (err, records) => {
    console.log("ERR =", err);
    console.log("RECORDS =", records);
  }
);