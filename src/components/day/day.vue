<template>
  <div class="w100% h100% flex">
    <div class="h100% flex flex-col select-none flex-1">
      <div class="b-t-solid b-t-1 b-b-solid b-b-3 b-#ccc flex flex-items-center font-size-3">
        <div class="w15 text-right line-height-6 color-#aaa pr-1">全天</div>
        <div class="flex-1 color-#fff fw-600 flex flex-col gap-1px">
          <div
            v-for="item of isAllDay"
            :key="item.id"
            class="b-rd h5 line-height-5 pl-1.5"
            :class="`bg-${item.color}`"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-scroll flex pt-1.6 pb-1.6">
        <!-- 刻度 -->
        <TimeScale class="w15" />
        <!-- 任务区域 -->
        <dayBody v-slot="slotProps" :data="formatData">
          <slot :data="slotProps.data"></slot>
        </dayBody>
      </div>
    </div>
    <MinCalendar class="w280px h300px px4" />
  </div>
</template>
<script setup lang="ts">
import { useDay } from '@/hooks/useDay';
import TimeScale from '@/components/time-scale/time-scale.vue';
import dayBody from './components/day-body.vue';
import MinCalendar from '../min-calendar/index.vue';

const { formatData, isAllDay } = useDay();
</script>
