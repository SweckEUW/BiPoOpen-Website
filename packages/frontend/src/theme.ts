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
    },
    components: {
        tabs: {
            colorScheme: {
                light: {
                    tablist: {
                        background: '#ffffff',
                        borderColor: 'transparent'
                    },
                    tab: {
                        background: '#ffffff',
                        color: '#4ab1c9',
                        activeBackground: '#EA5160',
                        activeColor: '#ffffff'
                    },
                    activeBar: {
                        background: '#EA5160'
                    }
                }
            },
            css: `
                .p-tablist-tab-list {
                    width: 100%;
                }
                .p-tab {
                    flex: 1;
                    justify-content: center;
                }
            `
        },
        datatable: {
            header: {
                padding: '0.5rem 0.5rem',
                sm: {
                    padding: '0.375rem 0.375rem'
                }
            },
            headerCell: {
                padding: '0.5rem 0.5rem',
                sm: {
                    padding: '0.375rem 0.375rem'
                }
            },
            bodyCell: {
                padding: '0.5rem 0.5rem',
                sm: {
                    padding: '0.375rem 0.375rem'
                }
            },
            colorScheme: {
                light: {
                    headerCell: {
                        background: '#EA5160',
                        color: '#ffffff',
                        borderColor: '#EA5160'
                    },
                    header: {
                        background: '#EA5160',
                        color: '#ffffff',
                        borderColor: '#EA5160'
                    }
                }
            },
            css: `
                .p-datatable *{
                    font-size: 14px;
                }
                .p-datatable-column-title {
                    font-size: 16px;
                    font-weight: bold;
                }
                .p-datatable-column-title{
                    width: 100%;
                    text-align: center;
                }
                .p-datatable-tbody *{
                    text-align: center !important;
                }
            `
        }
    }
});

export default BiPoPreset;
