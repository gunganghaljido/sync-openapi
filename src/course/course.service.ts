import type { PrismaClient } from '@prisma/client';

export class CourseService {
  key: string;
  url: string;
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.key = process.env.KEY!;
    this.url =
      'http://apis.data.go.kr/B551014/SRVC_OD_API_FACIL_COURSE/todz_api_facil_course_i';
    this.prisma = prisma;
  }

  async getLoopCount() {
    const param =
      `?serviceKey=${this.key}` +
      `&pageNo=1` +
      `&numOfRows=1` +
      `&resultType=json`;

    const response = await fetch(this.url + param);
    const data = (await response.json()) as CourseResponse;
    const totalCount = data.response.body.totalCount;

    return Math.floor((totalCount - 1) / 1000) + 1;
  }

  async saveAllCourse() {
    await this.prisma.course.deleteMany();
    const loopCount = await this.getLoopCount();

    for (let i = 1; i <= loopCount; i++) {
      const param =
        `?serviceKey=${this.key}` +
        `&pageNo=${i}` +
        `&numOfRows=1000` +
        `&resultType=json`;

      let data;
      const response = await fetch(this.url + param);
      try {
        data = (await response.json()) as CourseResponse;
      } catch (error) {
        console.log(i + '번째 데이터 안됨');
        continue;
      }
      const items = data.response.body.items.item;

      const courses = items.map((item) => {
        const workday: string[] = [];
        item.lectr_weekday_val.split('').forEach((isWorkday, index) => {
          if (isWorkday === '1') {
            switch (index) {
              case 0:
                workday.push('월');
                break;
              case 1:
                workday.push('화');
                break;
              case 2:
                workday.push('수');
                break;
              case 3:
                workday.push('목');
                break;
              case 4:
                workday.push('금');
                break;
              case 5:
                workday.push('토');
                break;
              case 6:
                workday.push('일');
                break;
            }
          }
        });

        let instructor: string | null;
        if (
          item.lectr_nm &&
          (item.lectr_nm.length === 2 || item.lectr_nm.length === 3)
        ) {
          instructor = item.lectr_nm;
        } else {
          instructor = null;
        }

        return {
          businessId: item.brno,
          facilitySerialNumber: item.facil_sn,
          courseId: item.course_no,
          courseName: item.course_nm,
          itemCode: item.item_cd,
          itemName: item.item_nm,
          instructor: instructor,
          startTime: item.start_tm,
          endTime: item.equip_tm,
          workday: workday.join(','),
          price: Number(item.settl_amt),
        };
      });

      await this.prisma.course.createMany({
        data: courses,
      });
    }
  }
}

export type CourseResponse = {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      pageNo: number;
      totalCount: number;
      items: {
        item: Course[];
      };
    };
  };
};

export type Course = {
  brno: string; // 사업자등록번호
  facil_sn: string; // 시설일련번호
  course_no: string; // 강좌번호
  course_nm: string; // 강좌명
  item_cd: string; // 종목코드
  item_nm: string; // 종목명
  lectr_nm?: string; // 강사명
  start_tm: string; // 시작시간
  equip_tm: string; // 종료시간
  lectr_weekday_val: string; // 강좌일
  course_seta_desc_cn: string; // 강좌상세설명
  settl_amt: string; // 수강료
  row_num: number; // 행번호
};
