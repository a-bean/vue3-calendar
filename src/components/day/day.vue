<template>
  <div class="w100% h100% flex">
    <div class="h100% flex flex-col select-none flex-1">
      <div class="b-t-solid b-t-1 b-b-solid b-b-3 b-#ccc flex flex-items-center">
        <div class="w15 text-right line-height-6 color-#aaa pr-1 font-size-3">全天</div>
        <div class="flex-1 flex flex-col gap-1px" @dblclick="addAllDayTask(store.currentDate[0].date)">
          <template v-for="item of isAllDay" :key="item.id">
            <Popover>
              <template #trigger>
                <div
                  class="task-default-opacity b-rd h5 line-height-5 pl-1.5 bg-blue color-#fff fw-600 font-size-3"
                  :class="`bg-${item.color} ${item.id === store.selectedTaskId ? 'task-active-opacity' : ''}`"
                  :style="{ backgroundColor: item.color }"
                  @click="selectedTask(item.id as number, item as TData)"
                >
                  {{ item.title }}
                </div>
              </template>
              <template #default>
                <slot name="popover" :data="item"></slot>
              </template>
            </Popover>
          </template>
        </div>
      </div>
      <div class="flex-1 overflow-scroll flex pt-1.6 pb-1.6">
        <!-- 刻度 -->
        <TimeScale class="w15" />
        <!-- 任务区域 -->
        <dayBody :data="formatData">
          <template #default="slotProps">
            <slot name="popover" :data="slotProps.data"></slot>
          </template>
        </dayBody>
      </div>
    </div>
    <div>
      <MinCalendar class="w280px h300px" />
      <div class="w280px">
        <slot name="day-detail" :data="store.selectedTask"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDay } from '@/hooks/useDay';
import TimeScale from '@/components/time-scale/time-scale.vue';
import dayBody from './components/day-body.vue';
import MinCalendar from '../min-calendar/index.vue';
import { useStore } from '@/hooks/useStore';
import { TData } from '@/types';
import Popover from '@/components/popover/popover.vue';

const { store, addAllDayTask, selectedTask } = useStore();

const { formatData, isAllDay } = useDay();
</script>
