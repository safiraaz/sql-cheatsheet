const CATS = ["Semua", "DDL", "DML", "DQL", "JOIN", "Agregasi", "Subquery", "Advanced", "String"];

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

const compatBadge = {
  mysql: '<span class="badge b-mysql">MySQL</span>',
  pg: '<span class="badge b-pg">PostgreSQL</span>',
  both: '<span class="badge b-both">MySQL + PG</span>'
};

// State global data card
let CARDS = [];
let activeCatVal = 'Semua';
