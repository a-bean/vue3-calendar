import { ref } from 'vue';
import { ECalendarType, TData, TDate } from '@/types';
import { getDaysScope, getDate } from '@/date';

type TStore = {
  data: { [key: string]: TData[] };
  calendarVisible: ECalendarType;
  currentDate: TDate[];
  selectedTaskId: number;
};

const store = ref<TStore>({
  calendarVisible: ECalendarType.DAY,
  data: {},
  currentDate: [],
  selectedTaskId: 0,
});

const onTaskChange = ref<(data: TData) => void>();
const onTaskDelete = ref<() => void>();

const currentDay = ref<string | Date>(new Date());

export const useStore = () => {
  /** 获取网络请求的数据 */
  const getData = (value: { [key: string]: TData[] }) => {
    store.value.data = value;
  };

  const onRecover = () => {
    store.value.currentDate = getDaysScope({
      type: store.value.calendarVisible,
      date: new Date(),
    });
    currentDay.value = getDate({ date: new Date() });
  };

  const onChange = (value: number) => {
    store.value.currentDate = getDaysScope({
      type: store.value.calendarVisible,
      date: store.value.currentDate[0].date,
      add: value,
    });
    currentDay.value = store.value.currentDate[0].date;
  };

  const selectedTask = (id: number) => {
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

  const addTask = (index: number, key: string) => {
    if (!store.value.data[key]) {
      store.value.data[key] = [];
    }

    store.value.data[key].push({
      id: Date.now(),
      start: `${key} ${index}:00:00`,
      end: `${key} ${index + 1}:00:00`,
      title: '新建任务',
    });
  };

  return {
    store,
    currentDay,
    getData,
    onRecover,
    onChange,
    onTaskChange,
    onTaskDelete,
    selectedTask,
    onKeydown,
    onKeyup,
    addTask,
  };
};
