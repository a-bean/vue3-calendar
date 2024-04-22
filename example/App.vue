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

const data = ref<{ [key: string]: TData[] }>({});
const getDateScope = (scope: [string, string]) => {
  // TODO:根据scope请求数据
  console.log('所展示的时间:', scope);
  data.value = {
    '2024-04-23': [
      { id: 13, title: '库里', start: '2024-04-23 03:00', end: '2024-04-23 07:00', color: 'purple' },
      { id: 14, title: '格林', start: '2024-04-23 04:00', end: '2024-04-23 05:00' },
      { id: 15, title: '汤普森', start: '2024-04-23 06:00', end: '2024-04-23 07:00' },
      { id: 16, title: '科比', start: '2024-04-23 08:00', end: '2024-04-23 09:00' },
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
