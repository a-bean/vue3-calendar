import { computed, ref } from 'vue';
import { ETaskMoveType, ONE_HOUR_HEIGHT } from '@/config';
import { getTimeInterval, getDate } from '@/date';
import { groupSchedulesByOverlap } from '@/utils';
import { useStore } from '@/hooks/useStore';

const BEST_TIME_SCALE = 15;
const taskBodyHeight = ref(0);
const { store, onTaskChange } = useStore();

export const useDay = () => {
  const formatData = computed(() => {
    /** 不是全天的task */
    const data =
      store.value.data?.[store.value.currentDate[0].date]?.filter((item) => {
        // 判断 结束时间 - 开始时间 是否小于 24 小时
        return getTimeInterval({ bigDate: item.end, smallDate: item.start, unit: 'hour' }) < 24;
      }) || [];
    return groupSchedulesByOverlap(data);
  });

  /** 是全天的task */
  const isAllDay = computed(() => {
    return store.value.data?.[store.value.currentDate[0].date]?.filter((item) => {
      return getTimeInterval({ bigDate: item.end, smallDate: item.start, unit: 'hour' }) >= 24;
    });
  });

  let isMousedown = false;
  let isMousemove = false;
  let initialY: number;
  let targetId: number;
  let moveType: ETaskMoveType;
  // 每像素对应的分钟数改为在 mousemove 时动态计算，避免初始高度为 0 或窗口尺寸变化导致比例错误
  // 累积分钟的浮点余量，避免格式化丢弃秒导致的向上移动“变快”现象
  let minuteAccumulator = 0;

  const changeMoveType = (type: ETaskMoveType) => {
    moveType = type;
  };

  const mousemove = (e: MouseEvent) => {
    if (!isMousedown) return;
    // 判断如果是initialY没有变化 就直接return
    if ((e as MouseEvent).movementY === 0 && e.clientY - initialY === 0) return;

    isMousemove = true;
    // 使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      const { date } = store.value.currentDate[0];
      const target = store.value.data[date].find((item) => item.id === targetId)!;
      // 动态计算像素与分钟的比例，保持与容器当前高度一致
      const everyPxOfMinute = 60 / (taskBodyHeight.value * (ONE_HOUR_HEIGHT / 100));
      // 优先使用 movementY（相对上一帧的位移，避免页面/容器滚动影响），回退到 clientY 差值
      const deltaY = (e as MouseEvent).movementY ?? e.clientY - initialY;
      const incrementalMinutesFloat = everyPxOfMinute * deltaY;
      minuteAccumulator += incrementalMinutesFloat;

      // 仅在达到整分钟时才更新，避免格式化到 'HH:mm' 时秒被截断导致的负方向偏差
      const wholeMinutes = minuteAccumulator < 0 ? Math.ceil(minuteAccumulator) : Math.floor(minuteAccumulator);
      if (wholeMinutes !== 0) {
        const adjustTime = (prop: 'start' | 'end') => {
          target[prop] = getDate({ date: target[prop], add: wholeMinutes, type: 'minute', format: 'YYYY-MM-DD HH:mm' });
        };

        if (moveType === ETaskMoveType.MOVE_TOP || moveType === ETaskMoveType.MOVE_WHOLE) {
          adjustTime('start');
        }
        if (moveType === ETaskMoveType.MOVE_BOTTOM || moveType === ETaskMoveType.MOVE_WHOLE) {
          adjustTime('end');
        }

        // 去掉已消费的整分钟，保留小数部分用于后续累积
        minuteAccumulator -= wholeMinutes;
      }

      initialY = e.clientY;
    });
  };

  const mouseup = () => {
    isMousedown = false;
    if (!isMousemove) {
      // 没有上下移动就不需要执行后续逻辑了
      window.removeEventListener('mouseup', mouseup);
      window.removeEventListener('mousemove', mousemove);
      return;
    }
    isMousemove = false;

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
      // 保持任务的位置信息，避免重新计算时位置变化
      const currentPosition = target.left;
      const currentWidth = target.width;

      onTaskChange.value?.(target);

      // 恢复位置信息
      if (currentPosition !== undefined) {
        target.left = currentPosition;
      }
      if (currentWidth !== undefined) {
        target.width = currentWidth;
      }
    }

    window.removeEventListener('mouseup', mouseup);
    window.removeEventListener('mousemove', mousemove);
  };

  const mousedown = (e: MouseEvent, id: number, type: ETaskMoveType) => {
    targetId = id;
    isMousedown = true;
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
    isAllDay,
    mousedown,
    mousemove,
    mouseup,
    mouseenter,
    changeMoveType,
  };
};
