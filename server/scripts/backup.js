// Гараар backup хийх: npm run backup
import { runBackup } from "../services/backup.js";
import { BACKUP_DIR } from "../config.js";

const name = runBackup();
console.log(`Backup бэлэн: ${BACKUP_DIR}/${name}`);
