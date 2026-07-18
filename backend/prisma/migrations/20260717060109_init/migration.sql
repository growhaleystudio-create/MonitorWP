-- CreateTable
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "latestVersion" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "expiredAt" DATETIME,
    "requiresUpdate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plugin_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UptimeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "isUp" BOOLEAN NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UptimeLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "errorCode" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "message" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referer" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorLog_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "ipAddress" TEXT,
    "username" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityEvent_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "telegramSent" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_apiKey_key" ON "Site"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_siteId_slug_key" ON "Plugin"("siteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");
