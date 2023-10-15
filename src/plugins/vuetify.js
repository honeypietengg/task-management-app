import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import 'vuetify/dist/vuetify.min.css';

// components

export default createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi', // Use 'mdi' for Material Design Icons
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#4b8dcb',
          'primary-lighten-1': '#69a1ff',
          'primary-lighten-2': '#a5c7ff',
          'primary-lighten-3': '#c3d9ff',
          'primary-lighten-4': '#e1ecff',
          secondary: '#5CBBF6',
        },
      },
    },
  },
});
