<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Import store
import useTaskStore from '../store/task';

import TASK from '../constants/task';

dayjs.extend(relativeTime);

const taskStore = useTaskStore();

// Define props
const { task } = defineProps({
  task: Object,
});

// Define emits
const emit = defineEmits(['edit', 'delete', 'comment']);

// Getter for boardname
const getBoardClass = (board) => {
  switch (board) {
    case TASK.STATUS.PROCESSING:
      return 'processing-board';
    case TASK.STATUS.DONE:
      return 'done-board';
    default:
      return 'default-board';
  }
};

const showCommentBox = ref(false);
const comment = ref(null);

// Defining arrow for different board
const canMoveForward = computed(() => {
  return (
    task.status === TASK.STATUS.PENDING ||
    task.status === TASK.STATUS.PROCESSING
  );
});

// Defining arrow for different board
const canMoveBackward = computed(() => {
  return task.status !== TASK.STATUS.PENDING;
});

// Moving the board based on the boardname
const moveTask = (direction) => {
  if (direction === 'forward' && canMoveForward.value) {
    // Move task forward logic
    taskStore.moveTaskForward(task.id);
  } else if (direction === 'backward' && canMoveBackward.value) {
    // Move task backward logic
    taskStore.moveTaskBackward(task.id);
  }
};

// Get the Attachment URL to open in a new tabs
const getAttachmentUrl = (attachment) => {
  if (attachment instanceof File) {
    return URL.createObjectURL(attachment);
  }
  if (typeof attachment === 'string') {
    return attachment;
  }

  return null;
};

const onDragStart = (event) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(task)); // Assuming task is available in the scope
};

const addComment = () => {
  emit('comment', task.id, comment.value);
  showCommentBox.value = false;
  comment.value = null;
};
</script>

<template>
  <v-card class="task-card" draggable="true" @dragstart="onDragStart">
    <div class="task-container" :class="getBoardClass(task.status)">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-buttons">
        <!-- Comment button -->
        <v-btn @click="showCommentBox = !showCommentBox" icon size="x-small">
          <v-icon>mdi-message</v-icon>
        </v-btn>

        <!-- Backward button -->
        <v-btn
          v-if="canMoveBackward"
          @click="moveTask('backward')"
          icon
          size="x-small"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <!-- Forward button -->
        <v-btn
          v-if="canMoveForward"
          @click="moveTask('forward')"
          icon
          size="x-small"
        >
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>

        <!-- Edit Button -->
        <v-btn icon @click="emit('edit', task.id)" size="x-small">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <!-- Delete Button -->
        <v-btn icon @click="emit('delete', task.id)" size="x-small">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="card-text-section">
      <v-card-subtitle>Task:</v-card-subtitle>
      <v-card-text>{{ task.title }}</v-card-text>
    </div>

    <div class="card-text-section">
      <v-card-subtitle>Description:</v-card-subtitle>
      <v-card-text>{{ task.description }}</v-card-text>
    </div>

    <div class="card-text-section">
      <v-card-subtitle>Estimated Time:</v-card-subtitle>
      <v-card-text v-if="task.estimatedTime">{{
        task.estimatedTime
      }}</v-card-text>
      <v-card-text v-else> - </v-card-text>
    </div>

    <div class="card-text-section">
      <v-card-subtitle>Attachments</v-card-subtitle>
      <v-card-text v-if="task.attachments.length">{{
        task.attachments.length
      }}</v-card-text>
      <v-card-text v-else> - </v-card-text>
      <v-list v-if="task.attachments && task.attachments.length">
        <v-list-item
          v-for="(attachment, index) in task.attachments"
          :key="index"
        >
          <span>
            <v-list-item-title>Attachment {{ index + 1 }}</v-list-item-title>
            <v-list-item-subtitle>
              <!-- Render attachment name as a link -->
              <a :href="getAttachmentUrl(attachment)" target="_blank">{{
                attachment.name
              }}</a>
            </v-list-item-subtitle>
          </span>
        </v-list-item>
      </v-list>
    </div>

    <div class="card-text-section">
      <v-list-item v-if="task.labels && task.labels.length" class="mr-4">
        <span>
          <v-list-item-subtitle>
            <v-chip class="mr-" v-for="label in task.labels" :key="label">{{
              label
            }}</v-chip>
          </v-list-item-subtitle>
        </span>
      </v-list-item>
    </div>

    <div v-if="task.comments.length">
      <v-divider></v-divider>
      <div class="card-text-section">
        <v-card-subtitle>Comments:</v-card-subtitle>
        <v-card-text v-for="c in task.comments" :key="c.createdAt">
          <div class="d-flex justify-space-between">
            <span>User 1: {{ c.content }}</span>
            <span class="text-grey font-italic text-caption">{{
              dayjs(c.createdAt).fromNow()
            }}</span>
          </div>
        </v-card-text>
      </div>
    </div>
    <div>
      <div v-if="showCommentBox" class="card-text-section">
        <v-textarea
          variant="outlined"
          hide-details
          label="Type something..."
          v-model="comment"
        ></v-textarea>
        <div class="d-flex justify-end mt-2 mb-4">
          <v-btn color="primary" @click="addComment">Add comment</v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.task-card {
  cursor: pointer;
  max-height: 1000px;
  overflow-y: auto;

  .v-card-text {
    padding: 2px 1rem;
  }

  .card-text-section {
    margin: 12px 1rem;
  }

  .v-card-title {
    font-size: 18px;
  }

  .v-card-actions {
    width: auto;
  }
}

.task-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: red;
}

.task-title {
  flex: 1;
}

.task-buttons {
  display: flex;
  gap: 8px;
}

.processing-board {
  background-color: #ffebee;
}

.done-board {
  background-color: #d9eeda;
}

.default-board {
  background-color: #4b8dcb;
}

.v-list-item-subtitle {
  .v-chip {
    margin-right: 4px;
    margin-bottom: 4px;
  }
}
</style>
