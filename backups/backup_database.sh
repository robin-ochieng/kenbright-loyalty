#!/bin/bash
# Kenbright 360 Database Backup Script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backups/daily"
LOG_FILE="../backups/logs/backup_$DATE.log"

echo "Starting backup at $(date)" >> $LOG_FILE

# Perform backup
"C:/Program Files/PostgreSQL/18/bin/pg_dump.exe" -h localhost -U postgres -d kenbright_360 -F c -b -v -f "$BACKUP_DIR/kenbright_360_$DATE.backup" >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "Backup completed successfully at $(date)" >> $LOG_FILE
    echo "Backup file: $BACKUP_DIR/kenbright_360_$DATE.backup" >> $LOG_FILE
    
    # Cleanup old backups (keep 7 days)
    find "$BACKUP_DIR" -name "kenbright_360_*.backup" -mtime +7 -delete >> $LOG_FILE 2>&1
else
    echo "Backup FAILED at $(date)" >> $LOG_FILE
    exit 1
fi
