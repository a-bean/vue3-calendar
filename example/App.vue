<template>
  <div class="h80vh w90vw">
    <Calendar v-slot="slotProps" :data="data" @get-date-scope="getDateScope" @change="onChange" @delete="onDelete">
      <!-- 用的人自己写吧。这个详情组件定制化程度很高，而且这边还需要用到日期选择器，时间选择器，每个项目都可能在其他地方已经引入了，为了样式统一等原因全部交由使用者自己来写-->
      <div class="h400px w400px bg-[#FFF] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.10)] p4 rd-2">
        <div @click="slotProps.data.start = '2024-03-07 04:00'">{{ slotProps.data }}</div>
      </div>
    </Calendar>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Calendar from '@/index.vue';
import { TData } from '@/types';
import dayjs from 'dayjs';

const tempDataKeys = dayjs().format('YYYY-MM-DD');

const data = ref<{ [key: string]: TData[] }>({});
const getDateScope = (scope: [string, string]) => {
  // TODO:根据scope请求数据·
  console.log('所展示的时间:', scope);
  data.value = {
    [tempDataKeys]: [
      { id: 13, title: '库里', start: `${tempDataKeys} 03:00`, end: `${tempDataKeys} 07:00`, color: '#8B5CF6' },
      { id: 14, title: '格林', start: `${tempDataKeys} 04:00`, end: `${tempDataKeys} 05:00`, color: '#10B981' },
      { id: 15, title: '汤普森', start: `${tempDataKeys} 06:00`, end: `${tempDataKeys} 07:00`, color: '#F59E0B' },
      { id: 16, title: '科比', start: `${tempDataKeys} 08:00`, end: `${tempDataKeys} 09:00`, color: '#EF4444' },
      // 添加更多重叠任务来测试排布
      { id: 17, title: '詹姆斯', start: `${tempDataKeys} 04:30`, end: `${tempDataKeys} 05:30`, color: '#3B82F6' },
      { id: 18, title: '杜兰特', start: `${tempDataKeys} 05:00`, end: `${tempDataKeys} 06:00`, color: '#EC4899' },
      { id: 19, title: '哈登', start: `${tempDataKeys} 05:30`, end: `${tempDataKeys} 06:30`, color: '#06B6D4' },
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
