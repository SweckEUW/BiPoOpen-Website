import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

// Brand colors: --main-color: #EA5160, --secondary-color: #61C3D9
const BiPoPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#fef2f3',
            100: '#fde6e8',
            200: '#fbd0d5',
            300: '#f8a9b2',
            400: '#f37a88',
            500: '#EA5160',
            600: '#d62f42',
            700: '#b42236',
            800: '#961f32',
            900: '#7f1f30',
            950: '#460c16'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#EA5160',
                    contrastColor: '#ffffff',
                    hoverColor: '#d62f42',
                    activeColor: '#b42236'
                },
                highlight: {
                    background: '#fde6e8',
                    focusBackground: '#fbd0d5',
                    color: '#b42236',
                    focusColor: '#961f32'
                }
            }
        }
    }
});

export default BiPoPreset;
