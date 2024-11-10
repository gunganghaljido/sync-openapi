import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { FacilityService } from './facility/facility.service';
import { CourseService } from './course/course.service';
import { SpecialCourseService } from './course/special-course.service';

dotenv.config();

async function main() {
  const prisma = new PrismaClient();

  const facilityService = new FacilityService(prisma);
  const courseService = new CourseService(prisma);
  const specialCourseService = new SpecialCourseService(prisma);

  await Promise.all([
    facilityService.saveAllFacility(),
    courseService.saveAllCourse(),
    specialCourseService.saveAllCourse(),
  ]);
}

main();
