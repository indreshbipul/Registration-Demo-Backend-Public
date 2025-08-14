-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "adharID" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "pan" TEXT,
    "otp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_adharID_key" ON "public"."User"("adharID");
