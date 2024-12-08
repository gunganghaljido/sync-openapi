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
export type CourseHistory = {
    businessId: string;
    facilityName: string;
    itemCode: string;
    itemName: string;
    address: string;
    detailAddress: string | null;
    courseName: string;
    courseId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    participantCount: number;
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
export type NormalFavorite = {
    userId: string;
    businessId: string;
    serialNumber: string;
    createdAt: Generated<Timestamp>;
};
export type NormalPreviousCourse = {
    businessId: string;
    serialNumber: string;
    count: number;
};
export type Notification = {
    id: Generated<string>;
    userId: string;
    businessId: string;
    serialNumber: string | null;
    facilityName: string;
    courseNames: string[];
    isViewed: Generated<boolean>;
    createdAt: Generated<Timestamp>;
};
export type Review = {
    id: Generated<string>;
    userId: string;
    businessId: string;
    serialNumber: string | null;
    score: number;
    content: string;
    createdAt: Generated<Timestamp>;
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
export type SpecialCourseHistory = {
    businessId: string;
    facilityName: string;
    itemCode: string;
    itemName: string;
    address: string;
    detailAddress: string | null;
    courseName: string;
    courseId: string;
    startDate: Timestamp;
    endDate: Timestamp;
    participantCount: number;
    price: number;
    cityCode: string;
    cityName: string;
    localCode: string;
    localName: string;
    phone: string | null;
};
export type SpecialFacility = {
    businessId: string;
    name: string;
    cityCode: string;
    cityName: string;
    localCode: string;
    localName: string;
    address: string;
    detailAddress: string | null;
    phone: string | null;
};
export type SpecialFavorite = {
    userId: string;
    businessId: string;
    createdAt: Generated<Timestamp>;
};
export type SpecialPreviousCourse = {
    businessId: string;
    count: number;
};
export type User = {
    id: string;
    email: string;
    nickname: string;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    Course: Course;
    CourseHistory: CourseHistory;
    Facility: Facility;
    NormalFavorite: NormalFavorite;
    NormalPreviousCourse: NormalPreviousCourse;
    Notification: Notification;
    Review: Review;
    SpecialCourse: SpecialCourse;
    SpecialCourseHistory: SpecialCourseHistory;
    SpecialFacility: SpecialFacility;
    SpecialFavorite: SpecialFavorite;
    SpecialPreviousCourse: SpecialPreviousCourse;
    User: User;
};
