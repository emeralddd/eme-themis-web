const Datastore = require('@seald-io/nedb');

const db = {};

db.users = new Datastore({ filename: './database/users.db', autoload: true });
db.submissions = new Datastore({ filename: './database/submissions.db', autoload: true });

module.exports.db = db;