-- CreateIndex
CREATE INDEX "Announcement_estateId_createdAt_idx" ON "Announcement"("estateId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "InviteToken_email_idx" ON "InviteToken"("email");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_estateId_status_idx" ON "MaintenanceRequest"("estateId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_submittedBy_idx" ON "MaintenanceRequest"("submittedBy");

-- CreateIndex
CREATE INDEX "Payment_levyId_idx" ON "Payment"("levyId");

-- CreateIndex
CREATE INDEX "Payment_residentId_idx" ON "Payment"("residentId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Resident_estateId_idx" ON "Resident"("estateId");

-- CreateIndex
CREATE INDEX "Resident_userId_idx" ON "Resident"("userId");

-- CreateIndex
CREATE INDEX "Resident_estateId_isActive_idx" ON "Resident"("estateId", "isActive");

-- CreateIndex
CREATE INDEX "ScanLog_vehicleId_idx" ON "ScanLog"("vehicleId");

-- CreateIndex
CREATE INDEX "ScanLog_estateId_scannedAt_idx" ON "ScanLog"("estateId", "scannedAt" DESC);

-- CreateIndex
CREATE INDEX "Vehicle_estateId_idx" ON "Vehicle"("estateId");

-- CreateIndex
CREATE INDEX "Vehicle_residentId_idx" ON "Vehicle"("residentId");

-- CreateIndex
CREATE INDEX "Visitor_estateId_status_idx" ON "Visitor"("estateId", "status");

-- CreateIndex
CREATE INDEX "Visitor_residentId_idx" ON "Visitor"("residentId");

-- CreateIndex
CREATE INDEX "Visitor_accessCode_idx" ON "Visitor"("accessCode");
