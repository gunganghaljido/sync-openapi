import * as dotenv from 'dotenv';
import { FacilityService } from './facility/facility.service';
import { CourseService } from './course/course.service';
import { PrismaClient } from '@prisma/client';

dotenv.config();

async function main() {
  const prisma = new PrismaClient();

  const facilityService = new FacilityService(prisma);
  const courseService = new CourseService(prisma);

  await Promise.all([
    facilityService.saveAllFacility(),
    courseService.saveAllCourse(),
  ]);
}

main();
