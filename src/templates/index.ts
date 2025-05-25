// src/templates/index.ts
import postgresql from './postgresql.json';
import mysql from './mysql.json';
import mongodb from './mongodb.json';
import oracle from './oracle.json';
import sqlserver from './sqlserver.json';

const connectorTemplates: Record<string, any> = {
  postgresql,
  mysql,
  mongodb,
  oracle,
  sqlserver,
};
export default connectorTemplates;
