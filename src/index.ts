import * as dotenv from 'dotenv';
import { FacilityService } from './facility/facility.service';
import { PrismaClient } from '@prisma/client';

dotenv.config();

async function main() {
  const prisma = new PrismaClient();

  const facilityService = new FacilityService(prisma);
  await facilityService.saveAllFacility();
}

main();
