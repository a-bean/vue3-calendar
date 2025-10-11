import { ref } from 'vue';
import { ECalendarType, TData, TDate } from '@/types';
import { getDaysScope, getDate } from '@/date';

type TStore = {
  data: { [key: string]: TData[] };
  calendarView: ECalendarType;
  currentDate: TDate[];
  selectedTaskId: number;
  selectedTask: TData | null;
};

const store = ref<TStore>({
  calendarView: ECalendarType.DAY,
  data: {},
  currentDate: [],
  selectedTaskId: 0,
  selectedTask: null,
});

const onTaskChange = ref<(data: TData) => void>();
const onTaskDelete = ref<() => void>();

const currentDay = ref<string | Date>(new Date());

export const useStore = () => {
  const setCalendarView = (view: ECalendarType) => {
    store.value.calendarView = view;
  };

  /** 获取网络请求的数据 */
  const getData = (value: { [key: string]: TData[] }) => {
    store.value.data = value;
  };

  const onRecover = () => {
    store.value.currentDate = getDaysScope({
      type: store.value.calendarView,
      date: new Date(),
    });
    currentDay.value = getDate({ date: new Date() });
  };

  const onChange = (value: number) => {
    store.value.currentDate = getDaysScope({
      type: store.value.calendarView,
      date: store.value.currentDate[0].date,
      add: value,
    });
    currentDay.value = store.value.currentDate[0].date;
  };

  const selectedTask = (id: number, data: TData) => {
    console.log('🚀 ~ selectedTask ~ data:', data.end);
    store.value.selectedTask = data;
    store.value.selectedTaskId = id;
  };

  const deleteTask = () => {
    if (!store.value.selectedTaskId) return;
    onTaskDelete.value?.();
  };

  let isPressedMeta = false;
  const clickMeta = () => {
    isPressedMeta = true;
  };

  const clickBackspace = () => {
    if (isPressedMeta) {
      deleteTask();
    }
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Meta') {
      clickMeta();
    }
    if (e.key === 'Backspace') {
      clickBackspace();
    }
  };

  const onKeyup = (e: KeyboardEvent) => {
    if (e.key === 'Meta') {
      isPressedMeta = false;
    }
  };

  const addAllDayTask = (day: string) => {
    if (!store.value.data[day]) {
      store.value.data[day] = [];
    }
    const day1 = getDate({ date: day, format: 'YYYY-MM-DD', add: 1 });
    store.value.data[day].push({
      id: Date.now(),
      start: `${day} 00:00:00`,
      end: `${day1} 00:00:00`,
      title: '新建任务',
    });
    /** 新增任务后，触发回调 */
    onTaskChange.value?.(store.value.data[day][store.value.data[day].length - 1]);
  };

  const addTask = (hour: number, day: string) => {
    if (!store.value.data[day]) {
      store.value.data[day] = [];
    }

    store.value.data[day].push({
      id: Date.now(),
      start: `${day} ${hour}:00:00`,
      end: `${day} ${hour + 1}:00:00`,
      title: '新建任务',
    });
    /** 新增任务后，触发回调 */
    onTaskChange.value?.(store.value.data[day][store.value.data[day].length - 1]);
  };

  return {
    store,
    currentDay,
    setCalendarView,
    getData,
    onRecover,
    onChange,
    onTaskChange,
    onTaskDelete,
    selectedTask,
    onKeydown,
    onKeyup,
    addTask,
    addAllDayTask,
  };
};
