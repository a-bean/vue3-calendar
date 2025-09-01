<template>
  <div
    v-for="(key, index) of store.currentDate"
    :key="key.date"
    class="flex-1 position-relative"
    @mouseenter="() => onColumnsMouseenter(key.date)"
  >
    <div class="position-absolute top--1.6 left-0 right-0 h1.6" :class="{ 'b-r-solid b-r-1 b-r-#ccc': index !== 7 }"></div>
    <TimeDivider :need-right-border="index !== 7" @ondblclick="(i) => addTask(i, key.date)" />
    <CurrentTimeline class="w100% position-absolute" :show-time="index === 0" />
    <template v-for="(items, index1) of groupSchedulesByOverlap(formatDataWeekData[key.date])" :key="index1">
      <template v-for="item of items" :key="item.id">
        <Popover>
          <template #trigger>
            <DayTask
              :data="item"
              :date-key="key.date"
              :style="{
                width: `${item.width || 100}%`,
                left: `${item.left || 0}%`,
              }"
            />
          </template>
          <template #default><slot :data="item"></slot></template>
        </Popover>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useStore } from '@/hooks/useStore';
import { useWeek } from '@/hooks/useWeek';
import TimeDivider from '@/components/time-divider/time-divider.vue';
import DayTask from './week-task.vue';
import { groupSchedulesByOverlap } from '@/utils';
import Popover from '@/components/popover/popover.vue';
import CurrentTimeline from '@/components/current-timeline/current-timeline.vue';

const { store, addTask } = useStore();
const { formatDataWeekData, onColumnsMouseenter } = useWeek();
</script>
<style>
.week-body-items {
  @apply flex-1 flex h100%;
}
</style>
