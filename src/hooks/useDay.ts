import { computed, ref } from 'vue';
import { ETaskMoveType, ONE_HOUR_HEIGHT } from '@/config';
import { getTimeInterval, getDate } from '@/date';
import { groupSchedulesByOverlap } from '@/utils';
import { useStore } from '@/hooks/useStore';

const MIN_HEIGHT = 15;
const BEST_TIME_SCALE = 15;
const taskBodyHeight = ref(0);
const { store, onTaskChange } = useStore();

export const useDay = () => {
  const formatData = computed(() => {
    const data = store.value.data?.[store.value.currentDate[0].date] || [];
    return groupSchedulesByOverlap(data);
    // return [
    //   [
    //     [{ id: 13, title: '库里', start: '2024-04-23 03:00', end: '2024-04-23 07:00', color: 'purple' }],
    //     [
    //       { id: 14, title: '格林', start: '2024-04-23 04:00', end: '2024-04-23 05:00' },
    //       { id: 15, title: '汤普森', start: '2024-04-23 06:00', end: '2024-04-23 07:00' },
    //     ],
    //   ],
    //   [[{ id: 16, title: '科比', start: '2024-04-23 08:00', end: '2024-04-23 09:00' }]],
    // ];
  });

  let isDragging = false;
  let initialY: number;
  let targetId: number;
  let moveType: ETaskMoveType;

  const changeMoveType = (type: ETaskMoveType) => {
    moveType = type;
  };

  const mousemove = (e: MouseEvent) => {
    if (!isDragging) return;

    const { date } = store.value.currentDate[0];
    const target = store.value.data[date].find((item) => item.id === targetId)!;
    const everyPxOfMinute = 60 / (taskBodyHeight.value * (ONE_HOUR_HEIGHT / 100));
    const incrementalTime = everyPxOfMinute * (e.clientY - initialY);

    const timesDiff = getTimeInterval({ bigDate: target.end, smallDate: target.start, unit: 'minute' });
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
  };

  const mouseup = () => {
    isDragging = false;

    // 滑动后调整开始或者结束时间，将时间的 分钟 总是调整为15的的倍数
    const { date } = store.value.currentDate[0];
    const target = store.value.data[date].find((item) => item.id === targetId)!;
    const oldDate = JSON.parse(JSON.stringify(target));
    const startRemainder = Number(getDate({ date: target.start, format: 'mm' })) % BEST_TIME_SCALE;
    const endRemainder = Number(getDate({ date: target.end, format: 'mm' })) % BEST_TIME_SCALE;
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
    if (oldDate.start !== target.start || oldDate.end !== target.end) {
      onTaskChange.value?.(target);
    }

    window.removeEventListener('mouseup', mouseup);
    window.removeEventListener('mousemove', mousemove);
  };

  const mousedown = (e: MouseEvent, id: number, type: ETaskMoveType) => {
    targetId = id;
    isDragging = true;
    initialY = e.clientY;

    changeMoveType(type);

    window.addEventListener('mouseup', mouseup);
    window.addEventListener('mousemove', mousemove);
  };

  const mouseenter = (type: ETaskMoveType) => {
    if (moveType === ETaskMoveType.MOVE_WHOLE) return;
    changeMoveType(type);
  };

  return {
    taskBodyHeight,
    formatData,
    mousedown,
    mousemove,
    mouseup,
    mouseenter,
    changeMoveType,
  };
};
