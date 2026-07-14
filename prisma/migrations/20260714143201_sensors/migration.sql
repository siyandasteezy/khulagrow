-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('TEMP_HUMIDITY', 'TEMPERATURE', 'HUMIDITY', 'PH', 'EC', 'CO2', 'OTHER');

-- AlterTable
ALTER TABLE "EnvironmentReading" ADD COLUMN     "sensorId" TEXT;

-- CreateTable
CREATE TABLE "Sensor" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SensorType" NOT NULL,
    "apiKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_apiKey_key" ON "Sensor"("apiKey");

-- CreateIndex
CREATE INDEX "Sensor_farmId_idx" ON "Sensor"("farmId");

-- CreateIndex
CREATE INDEX "EnvironmentReading_sensorId_at_idx" ON "EnvironmentReading"("sensorId", "at");

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentReading" ADD CONSTRAINT "EnvironmentReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
