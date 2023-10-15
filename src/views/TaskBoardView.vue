<script setup>
import { ref, computed } from 'vue';

// Import components
import TaskCard from '../components/TaskCard.vue';
import TaskProgressBar from '../components/TaskProgressBar.vue';

// Import constants
import TASK from '../constants/task';

// Import store
import useTaskStore from '../store/task';

const taskStore = useTaskStore();

const searchTerm = ref('');
const filteredTasks = ref([]);

// Define validation rules
const validateRules = [
  (value) => {
    if (value) return true;
    return 'Field is required';
  },
];

const onLabelsChange = (labels) => {
  labels.forEach((label) => {
    if (!taskStore.availableLabels.includes(label)) {
      taskStore.availableLabels.push(label);
    }
  });
};

/**
 * Create Task
 */
const showCreateDialog = ref(false);
const title = ref('');
const description = ref('');
const estimatedTime = ref(null);
const status = ref(null);
const attachments = ref([]);
const selectedLabels = ref([]);

const openCreateDialog = () => {
  showCreateDialog.value = true;
};

// Disabled the button if the value is not filled.
const isCreateButtonDisabled = computed(() => {
  return !title.value || !description.value || !status.value;
});

const closeCreateTaskDialog = () => {
  showCreateDialog.value = false;
  title.value = '';
  description.value = '';
  estimatedTime.value = null;
  status.value = null;
  attachments.value = null;
  selectedLabels.value = [];
};

const createTask = () => {
  const newTask = {
    id: null, // Let TaskStore generate the ID
    title: title.value,
    description: description.value,
    estimatedTime: estimatedTime.value ? estimatedTime.value : null,
    status: status.value,
    attachments: attachments.value ? [...attachments.value] : [], // Store File objects
    labels: selectedLabels.value, // Add selected labels to the task object
    comments: [],
  };
  taskStore.addTask(newTask);
  closeCreateTaskDialog();
};
/**
 *
 */

/**
 * Edit Task
 */
const showEditDialog = ref(false);
const newAttachments = ref([]);

const openEditDialog = (taskId) => {
  taskStore.selectEditedTask(taskId);
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
};

const removeAttachment = (index) => {
  taskStore.selectedEditedTask.attachments.splice(index, 1);
};

const editTask = () => {
  taskStore.selectedEditedTask.attachments = [
    ...taskStore.selectedEditedTask.attachments,
    ...newAttachments.value,
  ];
  taskStore.editTask();
  newAttachments.value = [];
  closeEditDialog();
};
/**
 *
 */

/**
 * Delete Task
 */
const showDeleteDialog = ref(false);

const openDeleteDialog = (taskId) => {
  taskStore.selectTask(taskId);
  showDeleteDialog.value = true;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
};

const deleteTask = () => {
  taskStore.deleteTask();
  closeDeleteDialog();
};
/**
 *
 */

/**
 * Search and filter task
 */
const searchTasks = () => {
  filteredTasks.value = taskStore.searchTasks(searchTerm.value);
};

const getTasksByStatus = (taskStatus) => {
  return (searchTerm.value ? filteredTasks.value : taskStore.tasks)?.filter(
    (task) => task.status === taskStatus,
  );
};
/**
 *
 */

/**
 *
 * Drag and drop
 */
const onDragOver = (event) => {
  event.preventDefault();
};

const onDrop = (taskStatus, event) => {
  const taskData = JSON.parse(event.dataTransfer.getData('text/plain'));
  // Find the task by its unique identifier (e.g., ID)
  const task = taskStore.tasks.find((t) => t.id === taskData.id);
  task.status = taskStatus;
};
/**
 *
 *
 */

/**
 * Comment
 */
const addComment = (taskId, comment) => {
  taskStore.addComment(taskId, comment);
};
/**
 *
 */
</script>

<template>
  <div>
    <task-progress-bar></task-progress-bar>

    <!-- Add and filter task -->
    <v-container>
      <v-row justify="end" align="center">
        <v-col cols="3">
          <div class="">
            <v-text-field
              hide-details="auto"
              v-model="searchTerm"
              placeholder="Search tasks"
              @input="searchTasks"
              class=""
            ></v-text-field>
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn
            outlined
            color="primary"
            @click="openCreateDialog"
            prepend-icon="mdi-plus"
            >ADD TASK</v-btn
          >
        </v-col>
      </v-row>
    </v-container>

    <!-- Task Board -->
    <v-container>
      <v-row>
        <v-col v-for="status in TASK.STATUSES" :key="status" cols="4">
          <v-card class="board-class">
            <v-card-title class="text-center">
              {{ status.charAt(0).toUpperCase() + status.substring(1) }}
              ({{ taskStore.getTaskCountByStatus(status) || 0 }}/{{
                taskStore.taskCount
              }})
            </v-card-title>

            <div class="task-card">
              <task-card
                v-for="task in getTasksByStatus(status)"
                :key="task.id"
                :task="task"
                @delete="openDeleteDialog"
                @edit="openEditDialog"
                @comment="addComment"
                @dragover="onDragOver"
                @drop="onDrop(status, $event)"
              />

              <v-list @dragover="onDragOver" @drop="onDrop(status, $event)">
                <v-list-item
                  v-if="getTasksByStatus(status).length === 0"
                  class="text-center"
                >
                  No tasks here
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add Task Dialog-->
    <v-dialog v-model="showCreateDialog">
      <v-card>
        <v-card-title>Add New Task</v-card-title>
        <v-card-text>
          <v-text-field
            :rules="validateRules"
            v-model="title"
            label="Title"
          ></v-text-field>
          <v-textarea
            :counter="100"
            :rules="validateRules"
            v-model="description"
            label="Description"
          ></v-textarea>
          <v-select
            :rules="validateRules"
            v-model="status"
            :items="TASK.STATUSES"
            label="Select Board"
          ></v-select>
          <v-combobox
            v-model="selectedLabels"
            :items="taskStore.availableLabels"
            label="Select Labels"
            multiple
            chips
            @update:modelValue="onLabelsChange"
          ></v-combobox>
          <v-text-field
            v-model="estimatedTime"
            label="Estimated Time"
            type="time"
          ></v-text-field>

          <v-file-input
            v-model="attachments"
            chips
            multiple
            label="Upload Attachment"
          ></v-file-input>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            rounded="lg"
            color="grey-lighten-1"
            variant="text"
            @click="closeCreateTaskDialog"
            >Cancel</v-btn
          >
          <v-btn
            rounded="lg"
            color="primary"
            variant="flat"
            :disabled="isCreateButtonDisabled"
            @click="createTask"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Task Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit Task</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="taskStore.selectedEditedTask.title"
            label="Title"
            :rules="validateRules"
          ></v-text-field>
          <v-textarea
            v-model="taskStore.selectedEditedTask.description"
            label="Description"
            :rules="validateRules"
          ></v-textarea>
          <v-text-field
            v-model="taskStore.selectedEditedTask.estimatedTime"
            label="Estimated Time"
            type="time"
          ></v-text-field>

          <!-- Editable Labels -->
          <v-combobox
            v-model="taskStore.selectedEditedTask.labels"
            :items="taskStore.availableLabels"
            label="Labels"
            chips
            multiple
            @update:modelValue="onLabelsChange"
          ></v-combobox>

          <!-- Existing Attachments -->
          <v-list
            v-if="
              taskStore.selectedEditedTask.attachments &&
              taskStore.selectedEditedTask.attachments.length
            "
          >
            <v-list-item
              v-for="(attachment, index) in taskStore.selectedEditedTask
                .attachments"
              :key="index"
            >
              <span>
                <v-list-item-title
                  >{{ attachment.name }}
                  <v-icon
                    size="small"
                    icon="mdi-delete"
                    class="ml-2"
                    color="red"
                    @click="removeAttachment(index)"
                  >
                  </v-icon>
                </v-list-item-title>
              </span>
            </v-list-item>
          </v-list>

          <!-- Upload New Attachments -->
          <v-file-input
            multiple
            v-model="newAttachments"
            label="New Attachments"
          ></v-file-input>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            rounded="lg"
            color="grey-lighten-1"
            variant="plain"
            @click="closeEditDialog"
            >Cancel</v-btn
          >
          <v-btn rounded="lg" color="primary" variant="flat" @click="editTask"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Task Dialog -->
    <v-dialog v-model="showDeleteDialog">
      <v-card>
        <v-card-title>Delete Task</v-card-title>
        <v-card-text>Are you sure you want to delete this task?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="red" @click="deleteTask">Yes</v-btn>
          <v-btn @click="closeDeleteDialog">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style>
.bordered-list-item {
  border: 1px solid #aaaaaa !important;
  padding: 0 !important;
  margin-bottom: 1rem;
}

.task-card {
  margin: 1rem;
}
</style>
