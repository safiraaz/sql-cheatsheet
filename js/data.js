const CATS = ["Semua","DDL","DML","DQL","JOIN","Agregasi","Subquery","Advanced","String"];

const badgeMap = {
  DDL: 'b-ddl',
  DML: 'b-dml',
  DQL: 'b-dql',
  JOIN: 'b-join',
  Agregasi: 'b-agg',
  Subquery: 'b-sub',
  Advanced: 'b-adv',
  String: 'b-str'
};

const DB_LABELS = {
  mysql:  {label:'MySQL',      cls:'b-mysql'},
  pg:     {label:'PostgreSQL', cls:'b-pg'},
  db2:    {label:'DB2',        cls:'b-db2'},
  oracle: {label:'Oracle',     cls:'b-oracle'},
  mssql:  {label:'MS SQL',     cls:'b-mssql'},
};

// State global data card (kosong karena akan diisi dari Supabase)
let CARDS = [];
let activeCatVal = 'Semua';
