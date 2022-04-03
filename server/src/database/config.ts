export const configDataBase = {
  connectionLimit: 10,
  password: process.env.passDB,
  user: process.env.userDB,
  database: process.env.database,
  host: process.env.hostDB,
  port: parseInt(process.env.portDB, 10),
  multipleStatements: true,
  charset: 'utf8mb4_unicode_ci',
};
