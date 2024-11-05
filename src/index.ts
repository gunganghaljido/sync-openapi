import * as dotenv from 'dotenv';
import { FacilityService } from './facility/facility.service';

dotenv.config();

async function main() {
  const facilityService = new FacilityService();
  await facilityService.printLocalCode();
}

main();
