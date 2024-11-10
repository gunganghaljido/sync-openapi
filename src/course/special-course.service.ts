import type { PrismaClient } from '@prisma/client';

export class SpecialCourseService {
  key: string;
  url: string;
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.key = process.env.KEY!;
    this.url =
      'http://apis.data.go.kr/B551014/SRVC_DVOUCHER_FACI_COURSE/TODZ_DVOUCHER_FACI_COURSE';
    this.prisma = prisma;
  }

  async getLoopCount() {
    const param =
      `?serviceKey=${this.key}` +
      `&pageNo=1` +
      `&numOfRows=1` +
      `&resultType=json`;

    const response = await fetch(this.url + param);
    const data = await response.json();

    const totalCount = data.response.body.totalCount;

    return Math.floor((totalCount - 1) / 1000) + 1;
  }

  async saveAllCourse() {
    await this.prisma.specialCourse.deleteMany();
    const loopCount = await this.getLoopCount();

    for (let i = 1; i <= loopCount; i++) {
      const param =
        `?serviceKey=${this.key}` +
        `&pageNo=${i}` +
        `&numOfRows=1000` +
        `&resultType=json`;

      const response = await fetch(this.url + param);
      const data = (await response.json()) as SpecialCourseResponse;
      const items = data.response.body.items.item;

      const courses = [];

      for (const item of items) {
        if (!item.start_time) continue;

        const workday: string[] = [];

        item.weekday.split('').forEach((isWorkday, index) => {
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

        courses.push({
          businessId: item.busi_reg_no,
          courseId: item.course_num,
          courseName: item.course_nm,
          itemName: item.cntnt_fst,
          startTime: item.start_time,
          endTime: item.end_time,
          workday: workday.join(','),
          price: Number(item.settl_amt),
        });
      }

      await this.prisma.specialCourse.createMany({
        data: courses,
      });
    }
  }
}

export type SpecialCourseResponse = {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    numOfRows: number;
    body: {
      pageNo: number;
      totalCount: number;
      items: {
        item: SpecialCourseItem[];
      };
    };
  };
};

export type SpecialCourseItem = {
  busi_reg_no: string; // 사업자등록번호
  course_num: string; // 강좌번호
  course_nm: string; // 강좌명
  cntnt_fst: string; // 종목명
  start_time: string;
  end_time: string;
  weekday: string;
  settl_amt: string; // 강좌금액
  row_num: number;
};
