import { computed, reactive, ref } from 'vue';
import { ETaskMoveType, ONE_HOUR_HEIGHT } from '@/config';
import { getTimeInterval, getDate, isBefore } from '@/date';
import { useStore } from '@/hooks/useStore';
import { formatWeekTask, findTaskById, findDropTargetDate as findDropTargetDate1 } from '@/utils';
import { TData } from '@/types';
import { cloneDeep } from 'lodash';

const MIN_HEIGHT = 15;
const BEST_TIME_SCALE = 15;
const taskBodyHeight = ref(0);
const { store, onTaskChange } = useStore();
let isDragging = false;
let initialY: number;
let targetId: number;
let moveType: ETaskMoveType;
// 用于跨日期的task，记录鼠标点击位置于开头时间的偏移天数
let interval: number;

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

export const useWeek = () => {
  const findDropTargetDate = (id: number) => {
    let moveTarget: TData = {} as TData;
    for (const dataKey in store.value.data) {
      if (!Object.prototype.hasOwnProperty.call(store.value.data, dataKey)) continue;
      // eslint-disable-next-line no-loop-func
      const targetData = store.value.data[dataKey].find((item) => item.id === id);
      if (targetData) {
        moveTarget = targetData;
        break;
      }
    }
    return moveTarget;
  };

  const formatDataWeekData = computed(() => {
    const tempData = cloneDeep(store.value.data);
    for (const dataKey in tempData) {
      if (!Object.prototype.hasOwnProperty.call(tempData, dataKey)) continue;
      tempData[dataKey] = tempData[dataKey].filter((item) => {
        const startHour = getDate({ date: item.start, format: 'HH:mm' });
        return startHour !== '00:00' && getTimeInterval({ bigDate: item.end, smallDate: item.start, unit: 'hour' }) !== 24;
      });
    }
    return formatWeekTask(tempData);
  });

  const isAllDay = computed(() => {
    const tempData = cloneDeep(store.value.data);
    for (const dataKey in tempData) {
      if (!Object.prototype.hasOwnProperty.call(tempData, dataKey)) continue;
      tempData[dataKey] = tempData[dataKey].filter((item) => {
        const startHour = getDate({ date: item.start, format: 'HH:mm' });
        return startHour === '00:00' && getTimeInterval({ bigDate: item.end, smallDate: item.start, unit: 'hour' }) >= 24;
      });
    }
    return formatWeekTask(tempData);
  });

  const changeMoveType = (type: ETaskMoveType) => {
    moveType = type;
  };

  const mousemove = (e: MouseEvent) => {
    if (!isDragging) return;

    // 使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      // 滑动后调整开始或者结束时间，将时间的 分钟 总是调整为15的的倍数
      let target: TData;
      for (const dataKey in store.value.data) {
        if (!Object.prototype.hasOwnProperty.call(store.value.data, dataKey)) continue;
        // eslint-disable-next-line no-loop-func
        const targetData = store.value.data[dataKey].find((item) => item.id === targetId);
        if (targetData) {
          target = targetData;
          break;
        }
      }

      const everyPxOfMinute = 60 / (taskBodyHeight.value * (ONE_HOUR_HEIGHT / 100));
      const incrementalTime = everyPxOfMinute * (e.clientY - initialY);

      const timesDiff = getTimeInterval({ bigDate: target!.end, smallDate: target!.start, unit: 'minute' });
      if (timesDiff <= MIN_HEIGHT && e.clientY > initialY && moveType === ETaskMoveType.MOVE_TOP) return;
      if (timesDiff <= MIN_HEIGHT && e.clientY < initialY && moveType === ETaskMoveType.MOVE_BOTTOM) return;

      const adjustTime = (prop: 'start' | 'end') => {
        target[prop] = getDate({ date: target[prop], add: incrementalTime, type: 'minute', format: 'YYYY-MM-DD HH:mm' });
      };
      if (moveType === ETaskMoveType.MOVE_TOP || moveType === ETaskMoveType.MOVE_WHOLE) {
        adjustTime('start');
      }
      if (moveType === ETaskMoveType.MOVE_BOTTOM || moveType === ETaskMoveType.MOVE_WHOLE) {
        adjustTime('end');
      }

      initialY = e.clientY;
    });
  };

  const mouseup = () => {
    isDragging = false;

    // 滑动后调整开始或者结束时间，将时间的 分钟 总是调整为15的的倍数
    const target = findDropTargetDate(targetId);
    const oldDate = JSON.parse(JSON.stringify(target!));
    const startRemainder = Number(getDate({ date: target!.start, format: 'mm' })) % BEST_TIME_SCALE;
    const endRemainder = Number(getDate({ date: target!.end, format: 'mm' })) % BEST_TIME_SCALE;
    const adjustTime = (remainder: number, prop: 'start' | 'end') => {
      const adjustValue = remainder < Math.round(BEST_TIME_SCALE / 2) ? -remainder : BEST_TIME_SCALE - remainder;
      target[prop] = getDate({ date: target[prop], add: adjustValue, type: 'minute', format: 'YYYY-MM-DD HH:mm' });
    };
    if (moveType === ETaskMoveType.MOVE_TOP || moveType === ETaskMoveType.MOVE_WHOLE) {
      adjustTime(startRemainder, 'start');
    }
    if (moveType === ETaskMoveType.MOVE_BOTTOM || moveType === ETaskMoveType.MOVE_WHOLE) {
      adjustTime(endRemainder, 'end');
    }

    // 如果时间有变化，触发回调
    if (oldDate.start !== target!.start || oldDate.end !== target!.end) {
      onTaskChange.value?.(target!);
    }

    window.removeEventListener('mouseup', mouseup);
    window.removeEventListener('mousemove', mousemove);
  };

  const mousedown = (e: MouseEvent, target: TData, type: ETaskMoveType) => {
    targetId = target.id as number;
    isDragging = true;
    initialY = e.clientY;

    const target1 = findDropTargetDate(targetId);
    interval = getTimeInterval({
      bigDate: target.start,
      smallDate: getDate({ date: target1.start, format: 'YYYY-MM-DD' }),
      unit: 'day',
    });

    changeMoveType(type);

    window.addEventListener('mouseup', mouseup);
    window.addEventListener('mousemove', mousemove);
  };

  const mouseenter = (type: ETaskMoveType) => {
    if (moveType === ETaskMoveType.MOVE_WHOLE) return;
    changeMoveType(type);
  };

  const onColumnsMouseenter = (key: string) => {
    if (!isDragging) return;
    const target = findDropTargetDate(targetId);
    const step =
      getTimeInterval({ bigDate: key, smallDate: getDate({ date: target.start, format: 'YYYY-MM-DD' }), unit: 'day' }) - interval;

    target.start = `${getDate({ date: target.start, format: 'YYYY-MM-DD', add: step })} ${getDate({
      date: target.start,
      format: 'HH:mm',
    })}`;

    target.end = `${getDate({ date: target.end, format: 'YYYY-MM-DD', add: step })} ${getDate({ date: target.end, format: 'HH:mm' })}`;

    onTaskChange.value?.(target);
  };

  const onDragStart = (e: DragEvent, data?: TData) => {
    if (!taskBoxWidth.value || !data) return;

    // dragData.targetFragmentStart = isBefore(isAllDay.value[0].date, data.start) ? data.start : isAllDay.value[0].date;
    dragData.targetEnd = data.end;
    dragData.targetId = data.id as number;
    dragData.offset = Math.floor(e.offsetX / taskBoxWidth.value);
    dragData.targetTask = findTaskById(dragData.targetId, store.value.data);
  };

  const onDragover = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent) => {
    dragData.targetDate = findDropTargetDate1(e.target as HTMLElement);

    const dataId = (e.target as HTMLElement).getAttribute('data-id');
    // 如果dataId有值，说明是task拖拽到另外一个task上了，这时候他会取另外
    // 一个task的头部所在的box的日期作为targetDate，所以得加一个偏移量。
    if (dataId) {
      const offset = Math.floor(e.offsetX / taskBoxWidth.value!);
      dragData.targetDate = getDate({ date: dragData.targetDate, add: offset });
    }

    if (!dragData.targetDate) return;

    /** 当前task片段的start与task的start的偏移天数 */
    const interval1 = getTimeInterval({
      bigDate: dragData.targetFragmentStart,
      smallDate: getDate({ date: dragData.targetTask!.start, format: 'YYYY-MM-DD' }),
      unit: 'day',
    });
    /** 鼠标点击的位置离这条task的start的偏移天数 */
    const clickOffset = interval1 + dragData.offset;

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
    // const newKey = isBefore(newTaskStart, completeData.value[0].date)
    //   ? completeData.value[0].date
    //   : getDate({ date: newTaskStart, format: 'YYYY-MM-DD' });

    // if (!store.value.data[newKey]) {
    //   store.value.data[newKey] = [];
    // }

    const newTask = {
      ...dragData.targetTask!,
      // id: dragData.targetId,
      start: newTaskStart,
      end: getDate({ date: dragData.targetTask!.end, add: taskOffset, type: 'day', format: 'YYYY-MM-DD HH:mm' }),
    };

    // if (getTimeInterval({ bigDate: newTask.end, smallDate: newTask.start, unit: 'day' }) > 0) {
    //   // task跨天就加在前面
    //   store.value.data[newKey].unshift(newTask);
    // } else {
    //   // task不跨天就加在后面
    //   store.value.data[newKey].push(newTask);
    // }
    onTaskChange.value?.(newTask);
  };

  return {
    formatDataWeekData,
    taskBodyHeight,
    mousedown,
    mousemove,
    mouseup,
    mouseenter,
    changeMoveType,
    onColumnsMouseenter,
    isAllDay,
    onDragStart,
    onDragover,
    onDrop,
  };
};
