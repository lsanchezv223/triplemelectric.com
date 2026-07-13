ALTER TABLE "work_entries"
ADD COLUMN "sharedGroupId" VARCHAR(64);

CREATE INDEX "work_entries_sharedGroupId_idx" ON "work_entries"("sharedGroupId");

DROP INDEX "work_entry_attachments_storageKey_key";
