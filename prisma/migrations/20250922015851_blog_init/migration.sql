-- CreateEnum
CREATE TYPE "public"."BlogStatus" AS ENUM ('active', 'inactive');


-- CreateTable
CREATE TABLE "public"."blog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "public"."BlogStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_name_key" ON "public"."blog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_slug_key" ON "public"."blog"("slug");
