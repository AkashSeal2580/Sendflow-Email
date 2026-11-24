-- AlterTable
ALTER TABLE `campaign` ADD COLUMN `senderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Campaign_senderId_idx` ON `Campaign`(`senderId`);

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `Sender`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
