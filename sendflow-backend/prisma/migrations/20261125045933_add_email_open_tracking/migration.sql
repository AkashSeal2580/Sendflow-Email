
-- Add tracking fields safely
ALTER TABLE `Email`
    ADD COLUMN `firstOpenedAt` DATETIME(3) NULL,
    ADD COLUMN `lastOpenedAt` DATETIME(3) NULL,
    ADD COLUMN `openCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trackingToken` VARCHAR(191) NULL;

-- Generate a unique token for every existing email
UPDATE `Email`
SET `trackingToken` = CONCAT('trk_', `id`)
WHERE `trackingToken` IS NULL;

-- Make trackingToken required
ALTER TABLE `Email`
    MODIFY COLUMN `trackingToken` VARCHAR(191) NOT NULL;

-- Add unique constraint
CREATE UNIQUE INDEX `Email_trackingToken_key`
ON `Email`(`trackingToken`);
