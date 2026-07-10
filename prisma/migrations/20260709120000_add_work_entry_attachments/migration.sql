-- CreateTable
CREATE TABLE "work_entry_attachments" (
    "id" TEXT NOT NULL,
    "workEntryId" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(512) NOT NULL,
    "mimeType" VARCHAR(120) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_entry_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_entry_attachments_storageKey_key" ON "work_entry_attachments"("storageKey");

-- CreateIndex
CREATE INDEX "work_entry_attachments_workEntryId_createdAt_idx" ON "work_entry_attachments"("workEntryId", "createdAt");

-- AddForeignKey
ALTER TABLE "work_entry_attachments" ADD CONSTRAINT "work_entry_attachments_workEntryId_fkey" FOREIGN KEY ("workEntryId") REFERENCES "work_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
