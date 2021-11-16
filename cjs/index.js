'use strict';
const plain = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('plain-tag'));
const {asStatic, asParams} = require('static-params');

const create = (db, name) => (tpl, ...values) => new Promise((res, rej) => {
  if (tpl.some(chunk => chunk.includes('?'))) {
    const error = new Error('SQLITE_ERROR: SQL injection hazard');
    error.code = 'SQLITE_ERROR';
    rej(error);
  }
  else {
    const [sql, ...params] = asParams(tpl, ...values);
    db[name](sql.join('?'), params, (err, val) => {
      if (err)
        rej(err);
      else
        res(val);
    });
  }
});

function SQLiteTag(db) {
  return {
    all: create(db, 'all'),
    get: create(db, 'get'),
    query: create(db, 'run'),
    raw: (tpl, ...values) => asStatic(plain(tpl, ...values))
  };
}
module.exports = SQLiteTag;
