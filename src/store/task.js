import { defineStore } from 'pinia';

import TASK from '../constants/task';

export default defineStore('task', {
  state: () => ({
    tasks: [],
    selectedTask: null,
    // Handle the task being edited
    selectedEditedTask: null,
    taskIdCounter: 1,
    availableLabels: ['Backend', 'Server', 'Front-end'],
  }),
  getters: {
    taskCount() {
      return this.tasks.length;
    },
  },
  actions: {
    getTaskCountByStatus(status) {
      return this.tasks.filter((task) => task.status === status).length;
    },
    addTask(newTask) {
      newTask.id = this.taskIdCounter++; // Assign a unique ID to the new task
      this.tasks.push(newTask);
    },
    selectTask(taskId) {
      this.selectedTask = this.tasks.find((task) => task.id === taskId);
    },
    selectEditedTask(taskId) {
      const task = this.tasks.find((t) => t.id === taskId);
      this.selectedEditedTask = { ...task, attachments: [...task.attachments] };
    },
    editTask() {
      // const taskIndex = this.tasks.findIndex(task => task.id === updatedTask.id);
      const taskIndex = this.tasks.findIndex(
        (task) => task.id === this.selectedEditedTask.id,
      );

      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...this.selectedEditedTask,
        attachments: [...this.selectedEditedTask.attachments],
      };
    },
    deleteTask() {
      this.tasks = this.tasks.filter(
        (task) => task.id !== this.selectedTask.id,
      );
    },
    searchTasks(searchTerm) {
      return this.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.labels.some((label) =>
            label.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    },
    deleteAttachment(taskId, attachmentName) {
      const task = this.tasks.find((task) => task.id === taskId);
      if (task) {
        task.attachments = task.attachments.filter(
          (attachment) => attachment !== attachmentName,
        );
      }
    },
    moveTaskForward(taskId) {
      const task = this.tasks.find((task) => task.id === taskId);
      if (task) {
        if (task.status === TASK.STATUS.PENDING) {
          task.status = TASK.STATUS.PROCESSING;
        } else if (task.status === TASK.STATUS.PROCESSING) {
          task.status = TASK.STATUS.DONE;
        }
      }
    },

    // Move a task backward (e.g., from Processing to Pending)
    moveTaskBackward(taskId) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task && task.status !== TASK.STATUS.PENDING) {
        if (task.status === TASK.STATUS.PROCESSING) {
          task.status = TASK.STATUS.PENDING;
        } else if (task.status === TASK.STATUS.DONE) {
          task.status = TASK.STATUS.PROCESSING;
        }
      }
    },
    addComment(taskId, comment) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.comments.push({
          content: comment,
          createdAt: new Date(),
        });
      }
    },
  },
});
