-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: sendflow_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('672f3371-e1a1-4e6f-aaa4-7f27e181d1dc','50e4753148440e935fc798fb54b01004688d3bb64cca3ee4a61437c56e782e51',NULL,'20261125045933_add_email_open_tracking','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261125045933_add_email_open_tracking\n\nDatabase error code: 1062\n\nDatabase error:\nDuplicate entry \'\' for key \'email.Email_trackingToken_key\'\n\nPlease check the query number 2 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20261125045933_add_email_open_tracking\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20261125045933_add_email_open_tracking\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260',NULL,'2026-11-25 05:01:05.768',0),('ee8f5b4b-a1ad-4255-9f8b-19388604f148','a1870a703734644b832b9a35ae7ba404c835ed5da0d25afc61eeff1752d4e2f5','2026-11-24 19:51:10.041','20261124195109_add_campaign_sender',NULL,NULL,'2026-11-24 19:51:09.865',1),('f35a47f3-c1ff-48eb-9784-8380a2b81352','4824f5094e112d4a4fe0886f13d9c9b763839af924749b1edc3514cbf7456ac1','2026-11-24 16:08:50.724','20261124160850_init',NULL,NULL,'2026-11-24 16:08:50.186',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaign`
--

DROP TABLE IF EXISTS `campaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `scheduledAt` datetime(3) DEFAULT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Campaign_userId_idx` (`userId`),
  KEY `Campaign_senderId_idx` (`senderId`),
  CONSTRAINT `Campaign_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `sender` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Campaign_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign`
--

LOCK TABLES `campaign` WRITE;
/*!40000 ALTER TABLE `campaign` DISABLE KEYS */;
INSERT INTO `campaign` VALUES ('cmwv0nepr0001ve4wf2tgmmlr','Test Campaign','Welcome to SendFlow','Hello! This is my first campaign.','Draft',NULL,'cmwuwpw1s0000vebg1yfj4h59','2026-11-24 18:16:28.478','2026-11-24 18:16:28.478',NULL),('cmwv0qtem0003ve4wf6e071eh','Frontend Test','Testing SendFlow','Hello! Testing campaign from frontend.','Draft',NULL,'cmwuwpw1s0000vebg1yfj4h59','2026-11-24 18:19:07.483','2026-11-24 18:19:07.483',NULL),('cmwv11h480007ve4w94i4si15','Akash','nothing','hii everyone','Draft',NULL,'cmwuwpw1s0000vebg1yfj4h59','2026-11-24 18:27:24.776','2026-11-24 20:57:49.311',NULL),('cmwv133k10009ve4wrdp9t74k','vrgergerger','bfberger','r gkjrgerjger','Scheduled','2026-11-25 04:58:00.000','cmwuwpw1s0000vebg1yfj4h59','2026-11-24 18:28:40.513','2026-11-24 18:28:40.513',NULL),('cmwv2rgpi0004vej8q3djt1d4','dkensfnf','fenfioefneiofiof','efiefufewufewnfbkndvjvi','Scheduled','2026-11-26 04:40:00.000','cmwuwpw1s0000vebg1yfj4h59','2026-11-24 19:15:36.917','2026-11-24 19:15:36.917',NULL),('cmwv3gtc10001veng49jtba9r','efnefioniof','ndifnewfiefiof','efnfnwifnfnfefpewf','Completed','2026-11-25 04:00:00.000','cmwuwpw1s0000vebg1yfj4h59','2026-11-24 19:35:19.678','2026-11-25 04:07:42.432','cmwv08sac0003vebshhum867y'),('cmwv4li8p0001vesky0ww4kpf','Scheduler Test','SendFlow Automatic Test','Hello! This is an automatic scheduled email test from SendFlow.','Completed','2026-11-24 20:12:00.000','cmwuwpw1s0000vebg1yfj4h59','2026-11-24 20:06:58.198','2026-11-24 20:12:21.956','cmwv08sac0003vebshhum867y');
/*!40000 ALTER TABLE `campaign` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email`
--

DROP TABLE IF EXISTS `email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Scheduled',
  `scheduledAt` datetime(3) DEFAULT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `error` text COLLATE utf8mb4_unicode_ci,
  `campaignId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `firstOpenedAt` datetime(3) DEFAULT NULL,
  `lastOpenedAt` datetime(3) DEFAULT NULL,
  `openCount` int NOT NULL DEFAULT '0',
  `trackingToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Email_campaignId_idx` (`campaignId`),
  KEY `Email_senderId_idx` (`senderId`),
  KEY `Email_status_idx` (`status`),
  CONSTRAINT `Email_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `campaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Email_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `sender` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email`
--

LOCK TABLES `email` WRITE;
/*!40000 ALTER TABLE `email` DISABLE KEYS */;
INSERT INTO `email` VALUES ('cmwv2cvko0000vej83w1uqzin','test1@example.com','Welcome to SendFlow','Draft',NULL,NULL,NULL,'cmwv0nepr0001ve4wf2tgmmlr',NULL,'2026-11-24 19:04:16.343','2026-11-24 19:04:16.343',NULL,NULL,0,''),('cmwv2cvks0001vej8y3reixvy','test2@example.com','Welcome to SendFlow','Draft',NULL,NULL,NULL,'cmwv0nepr0001ve4wf2tgmmlr',NULL,'2026-11-24 19:04:16.343','2026-11-24 19:04:16.343',NULL,NULL,0,''),('cmwv2cvks0002vej8zu7erdg0','test3@example.com','Welcome to SendFlow','Draft',NULL,NULL,NULL,'cmwv0nepr0001ve4wf2tgmmlr',NULL,'2026-11-24 19:04:16.343','2026-11-24 19:04:16.343',NULL,NULL,0,''),('cmwv2rgqp0005vej8c8e8ggyq','test1@example.com','fenfioefneiofiof','Scheduled','2026-11-26 04:40:00.000',NULL,NULL,'cmwv2rgpi0004vej8q3djt1d4',NULL,'2026-11-24 19:15:36.961','2026-11-24 19:15:36.961',NULL,NULL,0,''),('cmwv2rgqp0006vej8wcs6nhru','test2@example.com','fenfioefneiofiof','Scheduled','2026-11-26 04:40:00.000',NULL,NULL,'cmwv2rgpi0004vej8q3djt1d4',NULL,'2026-11-24 19:15:36.961','2026-11-24 19:15:36.961',NULL,NULL,0,''),('cmwv2rgqp0007vej84vgbcrn3','test3@example.com','fenfioefneiofiof','Scheduled','2026-11-26 04:40:00.000',NULL,NULL,'cmwv2rgpi0004vej8q3djt1d4',NULL,'2026-11-24 19:15:36.961','2026-11-24 19:15:36.961',NULL,NULL,0,''),('cmwv3gtdm0002veng6r5gjd7a','akashseal2604@gmail.com','ndifnewfiefiof','Sent','2026-11-25 04:00:00.000','2026-11-25 04:07:42.403',NULL,'cmwv3gtc10001veng49jtba9r','cmwv08sac0003vebshhum867y','2026-11-24 19:35:19.738','2026-11-25 04:07:42.405',NULL,NULL,0,''),('cmwv4liaj0002vesk91w58pqr','akashseal2604@gmail.com','SendFlow Automatic Test','Sent','2026-11-24 20:12:00.000','2026-11-24 20:12:21.942',NULL,'cmwv4li8p0001vesky0ww4kpf','cmwv08sac0003vebshhum867y','2026-11-24 20:06:58.267','2026-11-24 20:12:21.943',NULL,NULL,0,'');
/*!40000 ALTER TABLE `email` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sender`
--

DROP TABLE IF EXISTS `sender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sender` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `host` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port` int NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disconnected',
  `dailyLimit` int NOT NULL DEFAULT '100',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Sender_userId_idx` (`userId`),
  CONSTRAINT `Sender_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sender`
--

LOCK TABLES `sender` WRITE;
/*!40000 ALTER TABLE `sender` DISABLE KEYS */;
INSERT INTO `sender` VALUES ('cmwv08sac0003vebshhum867y','Akash seal','akashseal2604@gmail.com','smtp.gmail.com',587,'akashseal2604@gmail.com','a826897c5133f5a22b5c3454:a020b3ee9a9dfe7ee475ceec5d9c2823:4ee778b380cb5bf3d19d3e52e3325edc932bd7','Connected',100,'cmwuwpw1s0000vebg1yfj4h59','2026-11-24 18:05:06.224','2026-11-24 18:05:06.224');
/*!40000 ALTER TABLE `sender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('cmwuwpw1s0000vebg1yfj4h59','Akash','akash@example.com','$2b$12$DJFoMyHdLvEJTB/DiT9fsOnbH3aNk3jg/AxdBNQF9/3X9/3.X42Sy','2026-11-24 16:26:25.773','2026-11-24 16:26:25.773');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-25 10:50:31
