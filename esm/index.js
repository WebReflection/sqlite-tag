import plain from 'plain-tag';
import {asStatic, asParams} from 'static-params';

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

export default function SQLiteTag(db) {
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
};
