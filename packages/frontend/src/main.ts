import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router.js';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

const app = createApp(App);

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: false
        }
    }
});

app.use(router);
app.mount('#app');