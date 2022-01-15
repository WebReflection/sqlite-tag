'use strict';
const plain = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('plain-tag'));
const {asStatic, asParams} = require('static-params');

const {defineProperty} = Object;

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
  const query = create(db, 'run');
  return {
    transaction() {
      let t = query(['BEGIN TRANSACTION']);
      return defineProperty(
        (..._) => {
          t = t.then(() => query(..._));
        },
        'commit',
        {value() {
          return t = t.then(() => query(['COMMIT']));
        }}
      );
    },
    all: create(db, 'all'),
    get: create(db, 'get'),
    raw: (tpl, ...values) => asStatic(plain(tpl, ...values)),
    query
  };
}
module.exports = SQLiteTag;
