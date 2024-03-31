export type TDataInfo = {
  day: string;
  weekDay: string;
  dataList: unknown[];
};

export type TDate = {
  date: string;
  day?: string;
  lunarDay: string;
  lunarMonth: string;
  week: string;
  weekIndex: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFirstDayOfMonth: boolean;
  isFirstDayOfLunarMonth?: boolean;
  isSaturdayOrSunday: boolean;
};
export type TData = {
  id: number | string;
  title: string;
  start: string;
  end: string;
  /** 用来表示task是不是因为 显示 需要而新增出来的(目前只在week中有用) */
  hidden?: boolean;
  color?: string;
  left?: number;
  width?: number;
  overlap?: TData[];
};

export type TYearDate = {
  date: string;
  day: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFirstDayOfLunarMonth: boolean;
  weekIndex: number;
  month: string;
};

/** 1:日 2:周 3:月 4:年 */
export enum ECalendarType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}
