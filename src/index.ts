import * as dotenv from 'dotenv';
dotenv.config();
import { FacilityService } from './facility/facility.service';
import { CourseService } from './course/course.service';
import { SpecialCourseService } from './course/special-course.service';
import { db } from './db/database';
import { Handler } from 'aws-lambda';

export const handler: Handler = async () => {
  const facilityService = new FacilityService(db);
  const courseService = new CourseService(db);
  const specialCourseService = new SpecialCourseService(db);

  await facilityService.saveAllFacility();
  await Promise.all([
    courseService.saveAllCourse(),
    specialCourseService.saveAllCourse(),
  ]);
};

// handler('' as any, {} as any, () => {});
