<script setup>
import { computed } from 'vue';
import useTaskStore from '../store/task';

import TASK from '../constants/task';

const taskStore = useTaskStore();

const progressPercentage = computed(() => {
  const completedTasks = taskStore.tasks.filter(
    (task) => task.status === TASK.STATUS.DONE,
  ).length;
  return (completedTasks / taskStore.taskCount) * 100;
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-center">Progress</v-card-title>
          <!-- Progress bar -->
          <div class="my-4 mx-8">
            <v-progress-linear
              :height="24"
              v-if="taskStore.taskCount > 0"
              v-model="progressPercentage"
              color="success"
            >
              <strong>
                {{ progressPercentage.toFixed(2) }}% (Done
                {{ taskStore.getTaskCountByStatus(TASK.STATUS.DONE) }}/{{
                  taskStore.taskCount
                }})
              </strong>
            </v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
