# sqlite-tag

[![Build Status](https://travis-ci.com/WebReflection/sqlite-tag.svg?branch=master)](https://travis-ci.com/WebReflection/sqlite-tag) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/sqlite-tag/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/sqlite-tag?branch=master)

<sup>**Social Media Photo by [Alexander Sinn](https://unsplash.com/@swimstaralex) on [Unsplash](https://unsplash.com/)**</sup>

Template literal tag based sqlite3 queries.

Available for [PostgreSQL](https://github.com/WebReflection/pg-tag/#readme) too.

```js
const sqlite3 = require('sqlite3').verbose();
const SQLiteTag = require('sqlite-tag');

const db = new sqlite3.Database(':memory:');
const {all, get, query, raw, transaction} = SQLiteTag(db);

(async () => {
  console.log('✔', 'table creation');
  await query`CREATE TABLE ${raw`lorem`} (info TEXT)`;

  console.log('✔', 'multiple inserts (transaction)');
  const insert = transaction();
  for (let i = 0; i < 10; i++)
    insert`INSERT INTO lorem VALUES (${'Ipsum ' + i})`;
  await insert.commit();

  console.log('✔', 'Single row');
  const row = await get`
    SELECT rowid AS id, info
    FROM ${raw`lorem`}
    WHERE info = ${'Ipsum 5'}
  `;
  console.log(' ', row.id + ": " + row.info);

  console.log('✔', 'Multiple rows');
  const TABLE = 'lorem';
  const rows = await all`SELECT rowid AS id, info FROM ${raw`${TABLE}`}`;
  for (const row of rows)
    console.log(' ', row.id + ": " + row.info);

  // automatically and safely expanded as ?, ?
  const list = ['Ipsum 2', 'Ipsum 3'];
  console.log('✔', 'IN clause');
  console.log(' ', await all`SELECT * FROM lorem WHERE info IN (${list})`);

  console.log('✔', 'Error handling');
  try {
    await query`INSERT INTO shenanigans VALUES (1, 2, 3)`;
  }
  catch ({code}) {
    console.log(' ', code);
  }

  db.close();
})();

```

## API

Every exported method can be used either as function or as template literal tag.

  * `all` to retrieve all rows that match the query
  * `get` to retrieve one row that matches the query
  * `query` to simply query the database
  * `raw` to enable raw interpolations within the query string (see next)

### The `raw` utility

Every hole within the template literal will be passed as query parameter.
In some case though, we might need to define at runtime some part of the query, without it being necessarily a parameter.

This utility aim is to provide a mechanism that would not affect the query itself, or its parameters.

```js
// will insert into table_0, table_1, and table_2 respective `i` values
for (let i = 0; i < 3; i++)
  await query`INSERT INTO ${raw`table_${i}`} VALUES (${i})`;
```

The resulting operation, behind the scene, would be the following one:
```js
db.run('INSERT INTO table_0 VALUES (?)', [0]);
db.run('INSERT INTO table_1 VALUES (?)', [1]);
db.run('INSERT INTO table_2 VALUES (?)', [2]);
```

This also should explain how this library works: it's safe by default, as every hole becomes automatically a parameter, so that SQL injections are implicitly avoided.
