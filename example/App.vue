<template>
  <div style="height: 90vh; width: 100%">
    <Calendar :data="data" :calendar-view="ECalendarType.DAY" @get-date-scope="getDateScope" @change="onChange" @delete="onDelete">
      <!-- 用的人自己写吧。这个详情组件定制化程度很高，而且这边还需要用到日期选择器，时间选择器，每个项目都可能在其他地方已经引入了，为了样式统一等原因全部交由使用者自己来写-->
      <template #popover="slotProps">
        <div class="h400px w400px bg-[#FFF] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.10)] p4 rd-2">
          {{ slotProps.data }}
        </div>
      </template>

      <template #day-detail="slotProps">
        <div class="bg-[#FFF] p4">
          <div>{{ slotProps.data }}</div>
        </div>
      </template>
    </Calendar>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
// import { Calendar } from '../dist/calendar-vue.es';
// import '../dist/style.css';
import Calendar from '../src/index.vue';
import { TData, ECalendarType } from '../src/types';
import dayjs from 'dayjs';

const tempDataKeys = dayjs().format('YYYY-MM-DD');
const tempDataKeys1 = dayjs(tempDataKeys).add(1, 'day').format('YYYY-MM-DD');
const tempDataKeys2 = dayjs(tempDataKeys1).add(1, 'day').format('YYYY-MM-DD');

const data = ref<{ [key: string]: TData[] }>({});
const getDateScope = (scope: [string, string]) => {
  console.log('所展示的时间:', scope);
  data.value = {
    // [tempDataKeys1]: [
    //   { id: 24, title: '格林', start: `${tempDataKeys1} 04:00`, end: `${tempDataKeys1} 05:01`, color: '#10B981' },
    //   { id: 25, title: '库里', start: `${tempDataKeys1} 00:00`, end: `${tempDataKeys1} 00:02`, color: '#8B5CF6' },

    //   { id: 26, title: '汤普森', start: `${tempDataKeys1} 06:00`, end: `${tempDataKeys1} 07:00`, color: '#F59E0B' },
    //   { id: 27, title: '科比', start: `${tempDataKeys1} 08:00`, end: `${tempDataKeys1} 09:00`, color: '#EF4444' },
    //   // 添加更多重叠任务来测试排布
    //   { id: 29, title: '乔丹', start: `${tempDataKeys1} 04:30`, end: `${tempDataKeys1} 05:30`, color: '#3B82F6' },
    //   { id: 28, title: '杜兰特', start: `${tempDataKeys1} 05:00`, end: `${tempDataKeys1} 06:00`, color: '#EC4899' },
    //   { id: 30, title: '哈登', start: `${tempDataKeys1} 05:30`, end: `${tempDataKeys1} 06:30`, color: '#06B6D4' },
    //   // 来一个一整天的
    // ],
    [tempDataKeys]: [
      { id: 14, title: '格林', start: `${tempDataKeys} 00:00`, end: `${tempDataKeys} 00:01`, color: '#10B981' },
      { id: 13, title: '库里', start: `${tempDataKeys} 00:00`, end: `${tempDataKeys} 00:03`, color: '#8B5CF6' },

      // { id: 15, title: '汤普森', start: `${tempDataKeys} 06:00`, end: `${tempDataKeys} 07:00`, color: '#F59E0B' },
      // { id: 16, title: '科比', start: `${tempDataKeys} 08:00`, end: `${tempDataKeys} 09:00`, color: '#EF4444' },
      // // 添加更多重叠任务来测试排布
      // { id: 17, title: '乔丹', start: `${tempDataKeys} 04:30`, end: `${tempDataKeys} 05:30`, color: '#3B82F6' },
      // { id: 18, title: '杜兰特', start: `${tempDataKeys} 05:00`, end: `${tempDataKeys} 06:00`, color: '#EC4899' },
      // { id: 19, title: '哈登', start: `${tempDataKeys} 05:30`, end: `${tempDataKeys} 06:30`, color: '#06B6D4' },
      // // 来一个一整天的
      // { id: 20, title: '麦迪', start: `${tempDataKeys} 00:00`, end: `${tempDataKeys2} 00:00`, color: 'red' },

      // { id: 21, title: '麦迪', start: `${tempDataKeys} 00:00`, end: `${tempDataKeys1} 00:00`, color: 'red' },
      // { id: 23, title: '奥尼尔', start: `${tempDataKeys} 00:00`, end: `${tempDataKeys} 00:41`, color: 'blue' },
    ],
  };
};

const onChange = (value: TData) => {
  console.log(value);
};

const onDelete = (id: number) => {
  console.log(id);
  // TODO:先请求删除接口，成功后再删除任务
  for (const key in data.value) {
    if (Object.prototype.hasOwnProperty.call(data.value, key)) {
      data.value[key] = data.value[key].filter((item) => item.id !== id);
    }
  }
};
</script>
