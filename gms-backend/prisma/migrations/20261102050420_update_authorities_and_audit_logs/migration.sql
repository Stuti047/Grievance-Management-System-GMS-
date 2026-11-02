-- DropForeignKey
ALTER TABLE "authorities" DROP CONSTRAINT "authorities_user_id_fkey";

-- AlterTable
ALTER TABLE "authorities" ADD COLUMN     "contact_number" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'MITS Authority',
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "section" SET DEFAULT 'college';

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "authorities_status_idx" ON "authorities"("status");

-- CreateIndex
CREATE INDEX "authorities_department_idx" ON "authorities"("department");

-- AddForeignKey
ALTER TABLE "authorities" ADD CONSTRAINT "authorities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
