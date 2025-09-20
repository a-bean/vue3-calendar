# Smart Calendar Vue

A smart calendar component for Vue 3 with day, week, month and year views.

## Features

- 📅 Multiple view modes: Day, Week, Month, Year
- 🎨 Customizable styling with UnoCSS
- 📱 Responsive design
- 🔧 TypeScript support
- ⚡ Vue 3 Composition API

## Installation

```bash
npm install @abean/calendar.vue3
```

## Important: Style Import

⚠️ **You MUST import the CSS file for the component to display correctly:**

```javascript
import '@abean/calendar.vue3/dist/style.css';
```

## Usage

### Basic Usage

```vue
<template>
  <SmartCalendar :data="calendarData" @getDateScope="handleDateScope" @change="handleTaskChange" @delete="handleTaskDelete" />
</template>

<script setup>
import { SmartCalendar } from '@abean/calendar.vue3';
import '@abean/calendar.vue3/dist/style.css';

const calendarData = {
  '2024-01-01': [
    {
      id: 1,
      title: 'New Year',
      startTime: '09:00',
      endTime: '10:00',
      color: '#ff6b6b',
    },
  ],
};

const handleDateScope = (scope) => {
  console.log('Date scope:', scope);
};

const handleTaskChange = (task) => {
  console.log('Task changed:', task);
};

const handleTaskDelete = (id) => {
  console.log('Task deleted:', id);
};
</script>
```

### Global Registration

```javascript
import { createApp } from 'vue';
import SmartCalendar from '@abean/calendar.vue3';
import '@abean/calendar.vue3/dist/style.css';

const app = createApp(App);
app.use(SmartCalendar);
```

## Props

| Prop | Type   | Description                                         |
| ---- | ------ | --------------------------------------------------- |
| data | Object | Calendar data object with date keys and task arrays |

## Events

| Event        | Parameters             | Description                     |
| ------------ | ---------------------- | ------------------------------- |
| getDateScope | `[startDate, endDate]` | Emitted when date range changes |
| change       | `task`                 | Emitted when a task is modified |
| delete       | `taskId`               | Emitted when a task is deleted  |

## Task Data Structure

```typescript
interface TData {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}
```

## License

MIT
