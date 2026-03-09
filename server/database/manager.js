const Datastore = require('@seald-io/nedb');
const db = new Datastore({ filename: './database/data.json', autoload: true });

module.exports.db = db;