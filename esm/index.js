import plain from 'plain-tag';
import {asStatic, asParams} from 'static-params';

const create = (db, name) => (tpl, ...values) => new Promise((res, rej) => {
  if (tpl.some(invalid))
    rej(error(new Error('SQLITE_ERROR: SQL injection hazard')));
  const [sql, ...params] = asParams(tpl, ...values);
  db[name](sql.join('?'), params, (err, val) => {
    if (err) rej(err);
    else res(val);
  });
});

const error = error => ((error.code = 'SQLITE_ERROR'), error);

const raw = (tpl, ...values) => asStatic(plain(tpl, ...values));

const invalid = chunk => chunk.includes('?');

export default function SQLiteTag(db) {
  return {
    all: create(db, 'all'),
    get: create(db, 'get'),
    query: create(db, 'run'),
    raw
  };
};
