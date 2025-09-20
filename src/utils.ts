import { TData } from '@/types';
import { getDate, getTimeInterval } from '@/date';

/**
 * @function: convertTo2DArray
 * @description: 将一个数组分成多个指定大小的块
 * @param {Object} arr
 * @param {number} chunkSize
 * @return {T[][]}
 */
export const convertTo2DArray = <T>(arr: T[], chunkSize: number): T[][] => {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};

/**
 * @function : findDropTarget
 * @description : 找到最近有'data-date'属性的元素，返回其'data-date'属性值
 * @param {HTMLElement} element
 * @return {string | null}
 */
export const findDropTargetDate = (element: HTMLElement): string | null => {
  // 检查当前元素是否是 #dropTarget 或其子元素
  if (element.getAttribute('data-date')) {
    return element.getAttribute('data-date');
  }
  // 逐级向上查找祖先元素，直到找到 #dropTarget
  while (element.parentElement) {
    element = element.parentElement;
    if (element.getAttribute('data-date')) {
      return element.getAttribute('data-date');
    }
  }
  // 如果未找到 #dropTarget，返回 null
  return null;
};
/**
 * @function : generateUUID
 * @description : 生成一个uuid
 * @return {string}
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
};

/**
 * @function : typeOf
 * @description : 返回数据类型
 * @param {unknown} obj
 * @return {string}
 */
export const typeOf = (obj: unknown): string => {
  let res = Object.prototype.toString.call(obj).split(' ')[1];
  res = res.substring(0, res.length - 1).toLowerCase();
  return res;
};

/**
 * @function : findTaskById
 * @description : 找到指定id的任务
 * @param {number} idToFind
 * @param {{ [key: string]: TData[] }} data
 * @return {TData | null}
 */
export const findTaskById = (idToFind: number, data: { [key: string]: TData[] }) => {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const objects = data[key];
      const foundObject = objects.find((obj) => obj.id === idToFind);
      if (foundObject) {
        return foundObject;
      }
    }
  }
  return null;
};

const doSchedulesOverlap = (schedule1: TData, schedule2: TData) => {
  const start1 = new Date(schedule1.start).getTime();
  const end1 = new Date(schedule1.end).getTime();
  const start2 = new Date(schedule2.start).getTime();
  const end2 = new Date(schedule2.end).getTime();
  return start1 < end2 && end1 > start2;
};

/**
 * @function : calculateTaskLayout
 * @description : 计算重叠任务组中每个任务的位置和宽度
 * @param {TData[]} tasks
 * @return {TData[]}
 */
const calculateTaskLayout = (tasks: TData[]): TData[] => {
  if (tasks.length === 1) {
    return [
      {
        ...tasks[0],
        left: 0,
        width: 100,
      },
    ];
  }

  // 按开始时间排序，如果时间相同则按ID排序以保持稳定顺序
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeDiff = new Date(a.start).getTime() - new Date(b.start).getTime();
    if (timeDiff === 0) {
      // 如果时间相同，按ID排序以保持稳定顺序
      return Number(a.id) - Number(b.id);
    }
    return timeDiff;
  });

  // 创建时间线，计算每个时间段的并发数
  const timeline: { time: number; type: 'start' | 'end'; taskId: number | string }[] = [];
  sortedTasks.forEach((task) => {
    timeline.push(
      { time: new Date(task.start).getTime(), type: 'start', taskId: task.id },
      { time: new Date(task.end).getTime(), type: 'end', taskId: task.id }
    );
  });
  timeline.sort((a, b) => a.time - b.time);

  // 计算全局最大并发数
  let maxConcurrency = 0;
  const currentTasks = new Set<number | string>();
  timeline.forEach((event) => {
    if (event.type === 'start') {
      currentTasks.add(event.taskId);
    } else {
      currentTasks.delete(event.taskId);
    }
    maxConcurrency = Math.max(maxConcurrency, currentTasks.size);
  });

  // 为每个任务分配位置
  const result: TData[] = [];
  const taskPositions: { [key: string]: number } = {};

  // 按开始时间顺序分配位置
  sortedTasks.forEach((task) => {
    const taskId = task.id.toString();

    // 找到与当前任务重叠的其他任务
    const overlappingTasks = sortedTasks.filter((otherTask) => otherTask.id !== task.id && doSchedulesOverlap(task, otherTask));

    // 找到已分配位置的重叠任务
    const usedPositions = new Set<number>();
    overlappingTasks.forEach((otherTask) => {
      const otherPosition = taskPositions[otherTask.id.toString()];
      if (otherPosition !== undefined) {
        usedPositions.add(otherPosition);
      }
    });

    // 分配位置：优先保持任务在重叠组中的相对位置
    let position = 0;

    // 如果任务已经有位置信息，尝试保持该位置
    if (task.left !== undefined) {
      const preferredPosition = Math.round(task.left / (100 / maxConcurrency));
      if (!usedPositions.has(preferredPosition)) {
        position = preferredPosition;
      } else {
        // 如果首选位置被占用，找到最接近的可用位置
        let minDistance = Infinity;
        let bestPosition = 0;
        for (let i = 0; i < maxConcurrency; i++) {
          if (!usedPositions.has(i)) {
            const distance = Math.abs(i - preferredPosition);
            if (distance < minDistance) {
              minDistance = distance;
              bestPosition = i;
            }
          }
        }
        position = bestPosition;
      }
    } else {
      // 如果没有位置信息，找到第一个可用位置
      while (usedPositions.has(position)) {
        position++;
      }
    }

    taskPositions[taskId] = position;

    // 计算宽度 - 使用全局最大并发数
    const width = 100 / maxConcurrency;

    result.push({
      ...task,
      left: position * width,
      width,
    });
  });

  return result;
};

/**
 * @function : groupSchedulesByOverlap
 * @description : 将重叠的任务分组，并计算每个任务的位置和宽度
 * @param {TData[]} schedules
 * @return {TData[][]}
 */
export const groupSchedulesByOverlap = (schedules?: TData[]): TData[][] => {
  const result: TData[][] = [];

  if (!schedules) {
    return result;
  }

  // 按开始时间排序，如果时间相同则按ID排序以保持稳定顺序
  const sortedSchedules = [...schedules].sort((a, b) => {
    const timeDiff = new Date(a.start).getTime() - new Date(b.start).getTime();
    if (timeDiff === 0) {
      // 如果时间相同，按ID排序以保持稳定顺序
      return Number(a.id) - Number(b.id);
    }
    return timeDiff;
  });

  for (let i = 0; i < sortedSchedules.length; i++) {
    const resultIds = result.flat().map((item) => item.id);
    if (resultIds.includes(sortedSchedules[i].id)) {
      continue;
    }

    const arr: TData[] = [sortedSchedules[i]];
    for (let j = i + 1; j < sortedSchedules.length; j++) {
      if (resultIds.includes(sortedSchedules[j].id)) {
        continue;
      }

      const overlappingSchedule = arr.some((item) => doSchedulesOverlap(item, sortedSchedules[j]));
      if (overlappingSchedule) {
        arr.push(sortedSchedules[j]);
      }
    }

    // 计算每个任务的位置和宽度
    const groupWithLayout = calculateTaskLayout(arr);
    result.push(groupWithLayout);
  }
  return result;
};

/**
 * @function : formatWeekTask
 * @description : 格式化数据：将数据按照时间段分组
 * @param {{ [key: string]: TData[] }} events
 * @return {{ [key: string]: TData[] }}
 * @example
 *  {
 *   '2024-01-21': [ { id: 14, title: '库里', start: '2024-01-21 03:00', end: '2024-01-22 07:00' },],
 *   '2024-01-22': [{ id: 15, title: '库里', start: '2024-01-22 00:00', end: '2024-01-22 06:00' }]
 *  } 转化成 ==>
 *  {
 *   '2024-01-21': [ { id: 14, title: '库里', start: '2024-01-21 03:00', end: '2024-01-22 00:00' },],
 *   '2024-01-22': [
 *     { id: 14, title: '库里', start: '2024-01-22 00:00', end: '2024-01-22 07:00' },
 *     { id: 15, title: '库里', start: '2024-01-22 00:00', end: '2024-01-22 06:00' }
 *   ]
 *  }
 */
export const formatWeekTask = (events: { [key: string]: TData[] }): { [key: string]: TData[] } => {
  const dataCopy: { [key: string]: TData[] } = JSON.parse(JSON.stringify(events));

  for (const date in dataCopy) {
    if (!Object.prototype.hasOwnProperty.call(dataCopy, date)) {
      continue;
    }

    for (let i = 0; i < dataCopy[date].length; i++) {
      const key = getDate({ date: dataCopy[date][i].start, format: 'YYYY-MM-DD' });
      const oldTask = dataCopy[date][i];
      // 判断task的开始时间跟task数据的key是否相同，如果不同，说明跨天了，需要将task数据移动到对应的key中
      if (date !== key) {
        if (!dataCopy[key]) {
          dataCopy[key] = [];
        }
        dataCopy[key].unshift(dataCopy[date][i]);
        dataCopy[date] = dataCopy[date].filter((item) => item.id !== dataCopy[date][i].id);
        i--;
      }

      let interval = getTimeInterval({
        bigDate: getDate({ date: oldTask?.end, format: 'YYYY-MM-DD' }),
        smallDate: getDate({ date: oldTask?.start, format: 'YYYY-MM-DD' }),
        unit: 'day',
      });

      let add = 1;
      while (interval > 0) {
        const oldEnd = oldTask.end;
        const nextDayKey = getDate({ date: oldTask.start, add, type: 'day', format: 'YYYY-MM-DD' });
        // 如果不存在下一天的数据，就创建一个
        if (!dataCopy[nextDayKey]) {
          dataCopy[nextDayKey] = [];
        }
        // 已经存在相同的id项了，说明是同一个任务，只是跨天了
        if (dataCopy[nextDayKey].some((item) => item.id === oldTask.id)) {
          const targetIndex = dataCopy[nextDayKey].findIndex((item) => item.id === dataCopy[key][i].id);
          dataCopy[nextDayKey][targetIndex] = {
            ...oldTask,
            start: getDate({ date: nextDayKey, format: 'YYYY-MM-DD 00:00' }),
            end: oldEnd,
            hidden: true,
          };
        } else {
          // 不存在相同的id项，说明是不同的任务，需要新增
          dataCopy[nextDayKey].unshift({
            ...oldTask,
            start: getDate({ date: nextDayKey, format: 'YYYY-MM-DD 00:00' }),
            end: oldEnd,
            hidden: true,
          });
        }
        interval--;
        add++;
      }
    }
  }
  return dataCopy;
};
