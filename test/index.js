const sqlite3 = require('sqlite3').verbose();
const SQLiteTag = require('../cjs');

const db = new sqlite3.Database(':memory:');
const {all, get, query, raw, transaction} = SQLiteTag(db);

(async () => {
  console.log('✔', 'table creation');
  await query`CREATE TABLE ${raw`lorem`} (info TEXT)`;

  console.log('✔', 'multiple inserts (no statement)');
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
  const rows = await all`SELECT rowid AS id, info FROM ${raw`${TABLE}`} LIMIT ${0}, ${20}`;
  for (const row of rows)
    console.log(' ', row.id + ": " + row.info);

  console.log('✔', 'Error handling');
  try {
    await query`INSERT INTO shenanigans VALUES (1, 2, 3)`;
  }
  catch ({message}) {
    console.log(' ', message);
  }

  console.log('✔', 'SQL injection safe');
  try {
    await query`INSERT INTO shenanigans VALUES (?, ${2}, ${3})`;
  }
  catch ({message}) {
    console.log(' ', message);
  }

  db.close();
})();
