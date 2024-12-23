import type { Database } from 'src/db/database';
import { sql } from 'kysely';
import { v4 as uuidv4 } from 'uuid';

export class SpecialCourseService {
  key: string;
  url: string;
  db: Database;
  constructor(db: Database) {
    this.key = process.env.KEY!;
    this.url =
      'http://apis.data.go.kr/B551014/SRVC_DVOUCHER_FACI_COURSE/TODZ_DVOUCHER_FACI_COURSE';
    this.db = db;
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
    await this.db.deleteFrom('SpecialPreviousCourse').execute();
    await this.db.executeQuery(
      sql`
      insert into "SpecialPreviousCourse"("businessId", "count")
      SELECT 
        "businessId",
        count(*) as "count"
      FROM "SpecialCourse"
      GROUP BY 
        "businessId"
      `.compile(this.db)
    );

    await this.db.deleteFrom('SpecialCourse').execute();
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

        const allTypes = [
          '지체',
          '시각',
          '청각/언어',
          '지적/자폐',
          '뇌병변',
          '기타',
        ] as const;

        const disableType =
          allTypes[Math.floor(Math.random() * allTypes.length)]!;

        courses.push({
          businessId: item.busi_reg_no,
          courseId: item.course_num,
          courseName: item.course_nm,
          itemName: item.cntnt_fst,
          startTime: item.start_time,
          endTime: item.end_time,
          workday: workday.join(','),
          price: Number(item.settl_amt),
          type: disableType,
        });
      }

      await this.db.insertInto('SpecialCourse').values(courses).execute();
    }

    const afterResult = await this.db.executeQuery(
      sql<{ businessId: string }>`
        select
          a."businessId"
        from
          (select
            "businessId",
            count(*) as "count"
          from "SpecialCourse"
          group by
            "businessId") as a
        left join "SpecialPreviousCourse" as b
        on a."businessId" = b."businessId"
        where a."count" != b."count" or b."count" is null;
      `.compile(this.db)
    );

    for await (const facility of afterResult.rows) {
      const [facilityName, courseNames, users] = await Promise.all([
        this.db
          .selectFrom('SpecialFacility')
          .select('name')
          .where('businessId', '=', facility.businessId)
          .execute(),
        this.db
          .selectFrom('SpecialCourse')
          .select('courseName')
          .where('businessId', '=', facility.businessId)
          .execute(),
        this.db
          .selectFrom('SpecialFavorite')
          .select('userId')
          .where('businessId', '=', facility.businessId)
          .execute(),
      ]);

      if (
        facilityName.length === 0 ||
        facilityName[0] === undefined ||
        courseNames.length === 0 ||
        users.length === 0
      ) {
        continue;
      }

      for await (const user of users) {
        await this.db
          .insertInto('Notification')
          .values([
            {
              id: uuidv4(),
              userId: user.userId,
              businessId: facility.businessId,
              facilityName: facilityName[0].name,
              courseNames: courseNames.map((course) => course.courseName),
            },
          ])
          .execute();
      }
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
