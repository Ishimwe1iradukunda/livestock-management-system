import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("livestock_db", {
  migrations: "./migrations",
});
