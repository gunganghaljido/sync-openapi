import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Course = {
    businessId: string;
    facilitySerialNumber: string;
    courseId: string;
    courseName: string;
    itemCode: string;
    itemName: string;
    instructor: string | null;
    startTime: string;
    endTime: string;
    workday: string;
    price: number;
};
export type Facility = {
    businessId: string;
    serialNumber: string;
    name: string;
    cityCode: string;
    cityName: string;
    localCode: string;
    localName: string;
    address: string;
    detailAddress: string | null;
    owner: string;
    phone: string | null;
};
export type SpecialCourse = {
    businessId: string;
    courseId: string;
    courseName: string;
    itemName: string;
    startTime: string;
    endTime: string;
    workday: string;
    price: number;
    type: string;
};
export type DB = {
    Course: Course;
    Facility: Facility;
    SpecialCourse: SpecialCourse;
};
