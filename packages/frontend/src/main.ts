import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router.js';
import PrimeVue from 'primevue/config';
import BiPoPreset from '@/theme';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import "primeicons/primeicons.css"

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: BiPoPreset,
        options: {
            darkModeSelector: false
        }
    }
});

app.use(router);
app.mount('#app');