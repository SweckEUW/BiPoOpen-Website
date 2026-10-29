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
        // Minimale Reiter: linksbuendiger Text, aktiver Reiter rot mit Unterstrich
        tabs: {
            // Nur eine feine Linie unter den Reitern, kein Schatten
            tablist: {
                borderWidth: '0 0 1px 0'
            },
            tab: {
                borderWidth: '0',
                margin: '0',
                padding: '0.75rem 0',
                fontWeight: '700'
            },
            activeBar: {
                height: '3px',
                bottom: '0'
            },
            colorScheme: {
                light: {
                    tablist: {
                        background: '#ffffff',
                        borderColor: '#ECEEF1'
                    },
                    // Inhalt unter den Reitern liegt immer auf dem grauen Seitengrund
                    tabpanel: {
                        background: '#F6F7F9'
                    },
                    tab: {
                        background: 'transparent',
                        hoverBackground: 'transparent',
                        activeBackground: 'transparent',
                        color: '{surface.500}',
                        hoverColor: '{surface.800}',
                        activeColor: '{primary.color}'
                    },
                    activeBar: {
                        background: '{primary.color}'
                    }
                }
            },
            css: `
                .p-tablist-tab-list {
                    gap: 1.5rem;
                }
                .p-tablist-active-bar {
                    border-radius: 3px 3px 0 0;
                }

                /* Chip-Variante: <Tabs class="p-tabs-chips"> */
                .p-tabs-chips .p-tablist {
                    background: transparent;
                }
                .p-tabs-chips .p-tablist-tab-list {
                    gap: 0.5rem;
                    border-width: 0;
                }
                .p-tabs-chips .p-tab {
                    padding: 0.4rem 0.9rem;
                    font-size: 13px;
                    line-height: 1.2;
                    color: var(--p-surface-900);
                    background: #ffffff;
                    border: 1px solid var(--p-surface-300);
                    border-radius: 999px;
                }
                .p-tabs-chips .p-tab.p-tab-active {
                    color: #ffffff;
                    background: var(--main-color);
                    border-color: var(--main-color);
                }
                .p-tabs-chips .p-tablist-active-bar {
                    display: none;
                }
            `
        },
        // Segment-Auswahl (SelectButton): graue Leiste, aktive Option als weisse Pille
        selectbutton: {
            root: {
                borderRadius: '12px'
            }
        },
        togglebutton: {
            root: {
                padding: '0.25rem',
                fontWeight: '700'
            },
            content: {
                padding: '0.5rem 0.75rem',
                borderRadius: '9px',
                checkedShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.08), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)'
            }
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
                        borderColor: '#EA5160',
                        selectedBackground: '#EA5160',
                        selectedColor: '#ffffff'
                    },
                    header: {
                        background: '#EA5160',
                        color: '#ffffff',
                        borderColor: '#EA5160'
                    }
                }
            },
            css: `
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
