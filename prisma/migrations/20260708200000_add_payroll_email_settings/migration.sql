-- CreateTable
CREATE TABLE "payroll_email_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "toEmail" VARCHAR(255),
    "ccEmails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_email_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payroll_email_settings_key_key" ON "payroll_email_settings"("key");
