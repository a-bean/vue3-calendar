import { computed, reactive, ref } from 'vue';
import { cloneDeep } from 'lodash';
import { weeks, getWeekIndex, getDate, getLunarDay, getLunarMonth, getTimeInterval, isBefore } from '@/date';
import { convertTo2DArray, findDropTargetDate, findTaskById } from '@/utils';
import { TData, TDate } from '@/types';
import { useStore } from '@/hooks/useStore';

const { store, onTaskChange } = useStore();
const taskBoxWidth = ref<number>(); // 记录任务盒子的宽度

const dragData = reactive<{
  /** 选中的task的id */
  targetId: number;
  /** 鼠标移动停止所有在日期 */
  targetDate: string | null;
  /** 选中的task */
  targetTask: TData | null;
  /** 选中的task片段的开始时间 */
  targetFragmentStart: string;
  /** 选中的task片段的结束时间 */
  targetEnd: string;
  offset: number;
}>({
  targetId: 0,
  targetDate: '',
  targetTask: null,
  offset: 0,
  targetFragmentStart: '',
  targetEnd: '',
});

export const useMonth = () => {
  /** 填满日历 */
  const replenishCurrentDays = computed((): TDate[] => {
    if (!store.value.currentDate.length) return [];
    const newDays = cloneDeep(store.value.currentDate);

    // 补全前面的日期
    while (newDays[0].weekIndex !== 0) {
      const date = getDate({ date: newDays[0].date, add: -1 });
      newDays.unshift({
        date,
        day: date.slice(-2),
        weekIndex: newDays[0].weekIndex - 1,
        week: weeks[getWeekIndex(newDays[0].date, -1)],
        isCurrentMonth: false,
        isFirstDayOfMonth: false,
        isToday: false,
        isFirstDayOfLunarMonth: getLunarDay(date) === '初一',
        isSaturdayOrSunday: newDays[0].weekIndex - 1 === 0 || newDays[0].weekIndex - 1 === 6,
        lunarDay: getLunarDay(date),
        lunarMonth: getLunarMonth(date),
      });
    }
    // 补全后面的日期
    while (newDays[newDays.length - 1].weekIndex !== 6) {
      const date = getDate({ date: newDays[newDays.length - 1].date, add: 1 });
      newDays.push({
        date,
        day: date.slice(-2),
        weekIndex: newDays[newDays.length - 1].weekIndex + 1,
        week: weeks[getWeekIndex(newDays[newDays.length - 1].date, 1)],
        isCurrentMonth: false,
        isToday: false,
        isFirstDayOfMonth: false,
        isFirstDayOfLunarMonth: getLunarDay(date) === '初一',
        isSaturdayOrSunday: newDays[newDays.length - 1].weekIndex + 1 === 0 || newDays[newDays.length - 1].weekIndex + 1 === 6,
        lunarDay: getLunarDay(date),
        lunarMonth: getLunarMonth(date),
      });
    }

    return newDays;
  });

  /** 整合task后的数据 */
  const completeData = computed(() => {
    return replenishCurrentDays.value.map((item) => {
      return {
        ...item,
        dataList: store.value.data[item.date] || [],
      };
    });
  });

  /** 对completeData的数据进行跨日期处理 */
  const formatData = computed(() => {
    const list = cloneDeep(convertTo2DArray<TDate & { dataList: TData[] }>(completeData.value, 7));

    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[i].length; j++) {
        const { dataList } = list[i][j];
        if (!dataList) continue;
        for (let k = 0; k < dataList.length; k++) {
          const { end } = dataList[k];
          const start = isBefore(dataList[k].start, list[0][0].date) ? list[0][0].date : dataList[k].start;

          // 例如：end是2025-09-27 00:00，start是2025-09-26 00:00，那么interval就不用加1，end是2025-09-27 01:00，start是2025-09-26 00:00，那么interval就得加1
          const endHour = getDate({ date: end, format: 'HH:mm' });
          const interval = getTimeInterval({ bigDate: end, smallDate: start, unit: 'day' }) + (endHour === '00:00' ? 0 : 1);
          const offset = 7 - j;

          // 在当前行补充数据（占位，用id为string，后续显示隐藏掉），如果当前行不够，就补充下一行
          for (let l = 1; l < offset && interval > l; l++) {
            list[i][l + j].dataList.splice(k, 0, { id: '-1', title: '占位', start: '', end: '' });
          }

          // 补充下一行的数据
          if (interval > offset && i < list.length - 1 && list[i + 1] && list[i + 1][0]) {
            list[i + 1][0].dataList.unshift({
              ...dataList[k],
              start: getDate({ date: start, add: offset, format: 'YYYY-MM-DD HH:mm' }),
            });
          }
        }
      }
    }
    return list;
  });
  const onDragStart = (e: DragEvent, data?: TData) => {
    if (!taskBoxWidth.value || !data) return;

    dragData.targetFragmentStart = isBefore(completeData.value[0].date, data.start) ? data.start : completeData.value[0].date;
    dragData.targetEnd = data.end;
    dragData.targetId = data.id as number;
    dragData.offset = Math.floor(e.offsetX / taskBoxWidth.value);
    dragData.targetTask = findTaskById(dragData.targetId, store.value.data);
  };

  const onDragover = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent) => {
    dragData.targetDate = findDropTargetDate(e.target as HTMLElement);

    const dataId = (e.target as HTMLElement).getAttribute('data-id');
    // 如果dataId有值，说明是task拖拽到另外一个task上了，这时候他会取另外
    // 一个task的头部所在的box的日期作为targetDate，所以得加一个偏移量。
    if (dataId) {
      const offset = Math.floor(e.offsetX / taskBoxWidth.value!);
      dragData.targetDate = getDate({ date: dragData.targetDate, add: offset });
    }

    if (!dragData.targetDate) return;

    /** 当前task片段的start与task的start的偏移天数 */
    const interval = getTimeInterval({
      bigDate: dragData.targetFragmentStart,
      smallDate: getDate({ date: dragData.targetTask!.start, format: 'YYYY-MM-DD' }),
      unit: 'day',
    });
    /** 鼠标点击的位置离这条task的start的偏移天数 */
    const clickOffset = interval + dragData.offset;

    // 目标日期拼接上原来task的时分
    const newTaskStartDate = `${getDate({
      date: dragData.targetDate,
      format: 'YYYY-MM-DD',
    })} ${getDate({
      date: dragData.targetTask?.start,
      format: 'HH:mm',
    })}`;

    const newTaskStart = getDate({ date: newTaskStartDate, add: -clickOffset, type: 'day', format: 'YYYY-MM-DD HH:mm' });
    const taskOffset = getTimeInterval({ bigDate: newTaskStart, smallDate: dragData.targetTask!.start, unit: 'day' });
    if (taskOffset === 0) return;

    // remove old data
    for (const oldKey in store.value.data) {
      if (store.value.data[oldKey] && store.value.data[oldKey].some((item) => item.id === dragData.targetId)) {
        store.value.data[oldKey] = store.value.data[oldKey].filter((item) => item.id !== dragData.targetId);
      }
    }

    // add new data
    const newKey = isBefore(newTaskStart, completeData.value[0].date)
      ? completeData.value[0].date
      : getDate({ date: newTaskStart, format: 'YYYY-MM-DD' });

    if (!store.value.data[newKey]) {
      store.value.data[newKey] = [];
    }

    const newTask = {
      ...dragData.targetTask!,
      start: newTaskStart,
      end: getDate({ date: dragData.targetTask!.end, add: taskOffset, type: 'day', format: 'YYYY-MM-DD HH:mm' }),
    };

    if (getTimeInterval({ bigDate: newTask.end, smallDate: newTask.start, unit: 'day' }) > 0) {
      // task跨天就加在前面
      store.value.data[newKey].unshift(newTask);
    } else {
      // task不跨天就加在后面
      store.value.data[newKey].push(newTask);
    }
    onTaskChange.value?.(newTask);
  };

  return {
    // data
    replenishCurrentDays,
    completeData,
    formatData,
    taskBoxWidth,
    // fn
    onDragover,
    onDrop,
    onDragStart,
  };
};
