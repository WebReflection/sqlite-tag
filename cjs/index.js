'use strict';
const plain = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('plain-tag'));
const {asStatic, asParams} = require('static-params');

const create = (db, name) => (tpl, ...values) => new Promise((res, rej) => {
  const [sql, ...params] = asParams(tpl, ...values);
  db[name](sql.join('?'), params, (err, val) => {
    if (err) rej(err);
    else res(val);
  });
});

const raw = (tpl, ...values) => asStatic(plain(tpl, ...values));

function SQLiteTag(db) {
  return {
    all: create(db, 'all'),
    get: create(db, 'get'),
    query: create(db, 'run'),
    raw
  };
}
module.exports = SQLiteTag;
