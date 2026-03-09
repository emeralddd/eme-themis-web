const Datastore = require('@seald-io/nedb');
const db = new Datastore({ filename: './database/data.json', autoload: true });

console.log('abc');

module.exports.db = db;