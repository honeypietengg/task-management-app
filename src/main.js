import { createApp } from 'vue';
import App from './App.vue';
import './styles/main.css'; // Import main.css

// Plugins
import { registerPlugins } from './plugins';

const app = createApp(App);

registerPlugins(app);

app.mount('#app');
