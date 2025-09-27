import lunisolar from 'lunisolar';
import dayjs, { ConfigType, ManipulateType } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// 引入插件
// import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

import weekYear from 'dayjs/plugin/weekYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { TDate, TYearDate } from './types';

// 配置插件
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs().weekYear();

/** 星期配置 */
export const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月 ', '八月', '九月', '十月', '十一月', '十二月'];

export const weekthMap = new Map([
  [1, '第一周'],
  [2, '第二周'],
  [3, '第三周'],
  [4, '第四周'],
  [5, '第五周'],
  [6, '第六周'],
]);

/**
 * @function: getWeekIndex
 * @description: 放回星期的索引
 * @param {string} date
 * @param add
 * @return {number}
 */
export const getWeekIndex = (date?: ConfigType, add = 0): number => {
  const parsedDate = dayjs(date).add(add, 'day');
  // 获取一周中的某一天，返回一个数字（0 表示星期日，1 表示星期一，以此类推）
  return parsedDate.day();
};

type TGetDateType = {
  date?: ConfigType;
  add?: number;
  type?: ManipulateType;
  format?: string;
};
/**
 * @function: getDate
 * @description: 获取格式化的时间
 * @param {TGetDateType} config
 * @return {string} eg: YYYY-MM-DD
 */
export const getDate = (config: TGetDateType = {}): string => {
  const { date, add = 0, type = 'day', format = 'YYYY-MM-DD' } = config;
  return dayjs(date).add(add, type).format(format);
};

/**
 * @description: 判断某一天是不是一个月的第一天
 * @param {string} inputDate
 * @return {boolean}
 */
export const isFirstDayOfMonth = (inputDate: ConfigType): boolean => {
  const parsedDate = dayjs(inputDate);
  const firstDayOfMonth = parsedDate.startOf('month');
  return parsedDate.isSame(firstDayOfMonth, 'day');
};

/**
 * @description: 获取某一天的中国农历信息
 * @param date ConfigType 公历日期
 * @returns string 农历日期
 */
export const getLunarDay = (date: ConfigType) => {
  return lunisolar(date as lunisolar.DateConfigType).lunar.getDayName();
};
/**
 * @description: 获取某一天的中国农历信息
 * @param date ConfigType 公历日期
 * @returns string 农历月份
 */
export const getLunarMonth = (date: ConfigType) => {
  return lunisolar(date as lunisolar.DateConfigType).lunar.getMonthName();
};

/**
 * @description: 获取某一天的月份(中文)
 * @param date ConfigType 公历日期
 * @returns string 月份
 */
export const getChineseMonth = (date: ConfigType) => {
  return months[Number(dayjs(date).format('MM')) - 1];
};

/**
 * @description: 格式化周日期
 * @param {string[]} days
 * @return {*}
 */
const formatDays = (days: string[]): TDate[] => {
  return days.map((item) => {
    return {
      date: item,
      day: item.slice(-2),
      weekIndex: getWeekIndex(item),
      week: weeks[getWeekIndex(item)],
      isToday: item === getDate(),
      isFirstDayOfMonth: isFirstDayOfMonth(item),
      isFirstDayOfLunarMonth: getLunarDay(item) === '初一',
      lunarDay: getLunarDay(item),
      lunarMonth: getLunarMonth(item),
      isSaturdayOrSunday: getWeekIndex(item) === 0 || getWeekIndex(item) === 6,
      isCurrentMonth: true,
    };
  });
};

/**
 * @function getDaysScope
 * @description: 获取某一天（默认为当前日期）当前周一周的日期/当前月的日期
 * @param {{ type?: 'day'|'week' | 'month'|'year'; day?: ConfigType; add?: number }} params
 * @return {TDate[]}
 */
export const getDaysScope = (params: { type?: ManipulateType; date?: ConfigType; add?: number } = {}): TDate[] => {
  const { type = 'week', date = new Date(), add = 0 } = params;

  if (type === 'day') {
    return formatDays([dayjs(date).add(add, 'day').format('YYYY-MM-DD'), dayjs(date).add(add, 'day').format('YYYY-MM-DD')]);
  }
  const weekStart = dayjs(date).startOf(type).add(add, type);
  const weekEnd = dayjs(date).endOf(type).add(add, type);

  const dateRange = [];
  let currentDay = weekStart;

  while (currentDay.isSameOrBefore(weekEnd, 'day')) {
    dateRange.push(currentDay.format('YYYY-MM-DD'));
    currentDay = currentDay.add(1, 'day');
  }

  return formatDays(dateRange);
};

/**
 * @function getWeekthOfMonth
 * @description: 获取某一天（默认为当前日期）当前月的周数
 * @param {ConfigType} date
 * @return {number}
 */
export const getWeekthOfMonth = (date?: ConfigType): number => {
  const currentDate = dayjs(date);
  const currentWeekNumber = currentDate.week(); // 获取当前日期所在的年份和周数

  const firstDayOfMonth = currentDate.startOf('month'); // 获取当前月份的第一天
  const firstDayWeekNumber = firstDayOfMonth.week(); // 计算当前月份第一天所在的周数

  return currentWeekNumber - firstDayWeekNumber + 1;
};

/**
 * @function getTimeInterval
 * @description: 计算两个时间的间隔
 * @param {{ date1: ConfigType; date2: ConfigType; unit: ManipulateType }} data
 * @return {number} 间隔天数
 */

export const getTimeInterval = (data: { bigDate: ConfigType; smallDate: ConfigType; unit: ManipulateType }): number => {
  const { bigDate, smallDate, unit } = data;
  return dayjs(bigDate).diff(dayjs(smallDate), unit);
};

/**
 * @function getYearDates
 * @description: 获取一年的日期
 * @returns {TYearDate[][]} 全部日期
 */
export const getYearDates = (offset = 0): TYearDate[][] => {
  const yearDates = [];
  const currentDate = dayjs().add(offset, 'year');

  for (let month = 0; month < 12; month++) {
    const firstDayOfMonth = currentDate.month(month).startOf('month');
    const lastDayOfMonth = currentDate.month(month).endOf('month');

    const monthDates: TYearDate[] = [];
    let currentDay = firstDayOfMonth;

    while (currentDay.isSameOrBefore(lastDayOfMonth, 'day')) {
      monthDates.push({
        date: currentDay.format('YYYY-MM-DD'),
        day: currentDay.format('DD'),
        month: months[Number(currentDay.format('MM')) - 1],
        isToday: currentDay.isSame(dayjs(), 'day'),
        isFirstDayOfLunarMonth: getLunarDay(currentDay) === '初一',
        isCurrentMonth: true,
        weekIndex: getWeekIndex(currentDay.format('YYYY-MM-DD')),
      });

      currentDay = currentDay.add(1, 'day');
    }

    yearDates.push(monthDates);
  }
  return yearDates;
};

/**
 * @function isBefore
 * @description: 比较两个日期的大小
 * @param {ConfigType} beforeDate
 * @param {ConfigType} afterDate
 * @returns {boolean}
 */
export const isBefore = (beforeDate: ConfigType, afterDate: ConfigType): boolean => {
  return dayjs(beforeDate).isBefore(afterDate);
};

/**
 * @description: 按年月分组
 * @param {TDate[]} list
 * @returns {TDate[][]}
 */
export const groupDatesByMonth = (list: TDate[]): TDate[][] => {
  // 按年月分组
  const monthGroups = new Map<string, TDate[]>();

  for (const item of list) {
    const [year, month] = item.date.split('-');
    const monthKey = `${year}-${month}`;

    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, []);
    }

    monthGroups.get(monthKey)!.push(item);
  }

  // 将分组后的数据转换为数组，并按月份排序
  const resList = Array.from(monthGroups.values()).sort((a, b) => {
    const [yearA, monthA] = a[0].date.split('-');
    const [yearB, monthB] = b[0].date.split('-');
    return parseInt(yearA, 10) - parseInt(yearB, 10) || parseInt(monthA, 10) - parseInt(monthB, 10);
  });

  return resList;
};
