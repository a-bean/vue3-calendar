<template>
  <div class="h100% flex flex-col">
    <div v-for="(row, rowIndex) of formatData" :key="rowIndex" class="flex flex-1 b-t-1 b-t-#ccc b-t-solid overflow-hidden">
      <div
        v-for="(item, i) of row"
        :key="i"
        class="flex-1 b-r-1 b-r-#ccc b-r-solid box-border h100% w100%"
        :style="{
          borderRight: i === 6 ? 'none' : '',
          background: item.isSaturdayOrSunday ? '#f3f3f3' : '',
        }"
      >
        <MonthBodyItem v-slot="slotProps" :data="item">
          <slot :data="slotProps.data"></slot>
        </MonthBodyItem>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import MonthBodyItem from './month-body-item.vue';
import { useMonth } from '@/hooks/useMonth';

const { formatData } = useMonth();
</script>
