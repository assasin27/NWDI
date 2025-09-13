import cron from 'node-cron';
import { execSync } from 'child_process';
import logger from './logger';

// Database backup configuration
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const BACKUP_PATH = process.env.BACKUP_PATH || './backups';

// Backup schedule configuration
export const backupSchedule = {
  // Hourly incremental backup
  hourly: cron.schedule('0 * * * *', () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${BACKUP_PATH}/hourly_${timestamp}.sql`;
      
      execSync(`pg_dump -U ${DB_USER} -d ${DB_NAME} -f ${filename}`);
      logger.info(`Hourly backup created: ${filename}`);

      // Clean up old hourly backups (keep last 24)
      cleanOldBackups(`${BACKUP_PATH}/hourly_*.sql`, 24);
    } catch (error) {
      logger.error('Hourly backup failed:', error);
    }
  }),

  // Daily full backup
  daily: cron.schedule('0 0 * * *', () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${BACKUP_PATH}/daily_${timestamp}.sql`;
      
      execSync(`pg_dump -U ${DB_USER} -d ${DB_NAME} -F c -f ${filename}`);
      logger.info(`Daily backup created: ${filename}`);

      // Clean up old daily backups (keep last 30)
      cleanOldBackups(`${BACKUP_PATH}/daily_*.sql`, 30);
    } catch (error) {
      logger.error('Daily backup failed:', error);
    }
  }),

  // Start all backup schedules
  start() {
    this.hourly.start();
    this.daily.start();
    logger.info('Backup schedules started');
  },

  // Stop all backup schedules
  stop() {
    this.hourly.stop();
    this.daily.stop();
    logger.info('Backup schedules stopped');
  }
};

// Clean up old backups
function cleanOldBackups(pattern: string, keep: number) {
  try {
    const files = execSync(`ls -t ${pattern}`).toString().split('\n');
    if (files.length > keep) {
      files.slice(keep).forEach(file => {
        if (file) {
          execSync(`rm ${file}`);
          logger.info(`Deleted old backup: ${file}`);
        }
      });
    }
  } catch (error) {
    logger.error('Backup cleanup failed:', error);
  }
}
