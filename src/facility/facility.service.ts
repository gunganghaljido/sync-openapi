import { PrismaClient } from '@prisma/client';

export class FacilityService {
  key: string;
  url: string;
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.key = process.env.KEY!;
    this.url =
      'http://apis.data.go.kr/B551014/SRVC_OD_API_FACIL_MNG/todz_api_facil_mng_i';
    this.prisma = prisma;
  }

  async getLoopCount() {
    const param =
      `?serviceKey=${this.key}` +
      `&pageNo=1` +
      `&numOfRows=1` +
      `&resultType=json`;

    const response = await fetch(this.url + param);
    const data = (await response.json()) as FacilityResponse;
    const totalCount = data.response.body.totalCount;
    return Math.floor((totalCount - 1) / 1000) + 1;
  }

  async saveAllFacility() {
    await this.prisma.facility.deleteMany();
    const loopCount = await this.getLoopCount();

    for (let i = 1; i <= loopCount; i++) {
      const param =
        `?serviceKey=${this.key}` +
        `&pageNo=${i}` +
        `&numOfRows=1000` +
        `&resultType=json`;

      const response = await fetch(this.url + param);
      const data = (await response.json()) as FacilityResponse;
      const items = data.response.body.items.item;

      const facilities = await Promise.all(
        items.map(async (item) => {
          if (item.city_cd === '45') {
            item.city_cd = '52';
            if (item.local_cd.substring(0, 2) === '45') {
              item.local_cd = '52' + item.local_cd.substring(2);
            }
          } else if (item.city_cd === '42') {
            item.city_cd = '51';
            if (item.local_cd.substring(0, 2) === '42') {
              item.local_cd = '51' + item.local_cd.substring(2);
            }
          }

          return {
            businessId: item.brno,
            serialNumber: item.facil_sn,
            owner: item.pres_nm,
            cityCode: item.city_cd,
            cityName: item.city_nm,
            localCode: item.local_cd,
            localName: item.local_nm,
            name: item.facil_nm,
            phone: item.res_telno || null,
            address: item.road_addr,
            detailAddress: item.faci_daddr || null,
          };
        })
      );

      await this.prisma.facility.createMany({
        data: facilities,
      });
    }
  }

  async printLocalCode() {
    const codeSet = new Set() as Set<string>;
    const loopCount = await this.getLoopCount();

    for (let i = 1; i <= loopCount; i++) {
      const param =
        `?serviceKey=${this.key}` +
        `&pageNo=${i}` +
        `&numOfRows=1000` +
        `&resultType=json`;

      const response = await fetch(this.url + param);
      const data = (await response.json()) as FacilityResponse;
      const items = data.response.body.items.item;

      items.forEach((item) => {
        if (item.city_cd === '45') {
          item.city_cd = '52';
          if (item.local_cd.substring(0, 2) === '45') {
            item.local_cd = '52' + item.local_cd.substring(2);
          }
        } else if (item.city_cd === '42') {
          item.city_cd = '51';
          if (item.local_cd.substring(0, 2) === '42') {
            item.local_cd = '51' + item.local_cd.substring(2);
          }
        }

        codeSet.add(`${item.city_cd}-${item.local_cd}-${item.local_nm}`);
      });
    }

    const codeObject = {} as any;
    codeSet.forEach((code) => {
      const [cityCd, localCd, localNm] = code.split('-');
      if (!codeObject[cityCd!]) {
        codeObject[cityCd!] = {};
      }

      codeObject[cityCd!][localCd!] = localNm;
    });

    console.log(codeObject);
  }
}

export type FacilityResponse = {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      pageNo: number;
      totalCount: number;
      numOfRows: number;
      items: {
        item: FacilityItem[];
      };
    };
  };
};

export type FacilityItem = {
  main_event_cd: string; // 주종목코드
  city_nm: string; // 시도명
  main_event_nm: string; // 주종목명
  city_cd: string; // 시도코드
  pres_nm: string; // 대표자명
  faci_daddr?: string; // 시설상세주소
  row_num: number; // 행번호
  facil_nm: string; // 시설명
  facil_sn: string; // 시설일련번호
  road_addr: string; // 도로명주소
  local_nm: string; // 시군구명
  faci_zip: string; // 시설우편번호
  local_cd: string; // 시군구코드
  brno: string; // 사업자등록번호
  res_telno?: string; // 대표자전화번호
  facil_gbn_nm?: string; // 시설구분명
};
