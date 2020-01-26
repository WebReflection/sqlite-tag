const {defineProperty} = Object;
class Raw {
  constructor(value) {
    defineProperty(this, 'sql', {value});
  }
}

const create = (db, name) => (tpl, ...values) => new Promise((res, rej) => {
  const {sql, params} = ditchRaws(tpl, values);
  db[name](sql.join('?'), params, (err, val) => {
    if (err)
      rej(err);
    else
      res(val);
  });
});

const ditchRaws = (tpl, values) => {
  const sql = [tpl[0]];
  const params = [];
  for (let i = 1, j = 0, {length} = tpl; i < length; i++) {
    const value = values[i - 1];
    if (value instanceof Raw)
      sql[j] += value.sql + tpl[i];
    else {
      params.push(value);
      sql.push(tpl[i]);
      j++;
    }
  }
  return {sql, params};
};

const raw = (tpl, ...values) => {
  const out = [tpl[0]];
  for (let i = 1, {length} = tpl; i < length; i++)
    out.push(values[i - 1], tpl[i]);
  return new Raw(out.join(''));
};

export default function SQLiteTag(db) {
  return {
    all: create(db, 'all'),
    get: create(db, 'get'),
    query: create(db, 'run'),
    raw
  };
};
