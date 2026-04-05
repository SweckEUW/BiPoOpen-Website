<template>
    <Dialog
        v-model:visible="dialogVisible"
        modal
        :header="step === 'select' ? 'Profilbild ändern' : 'Bild zuschneiden'"
        :style="{ width: '95vw', maxWidth: '500px' }"
        :closable="!uploading"
        :draggable="false"
        @hide="onDialogHide"
    >
        <!-- Step 1: File Selection -->
        <div v-if="step === 'select'" class="flex flex-col items-center gap-4 py-4">
            <PlayerProfileAvatar :name="playerName" size="xlarge" shape="circle" class="!w-[250px] !h-[250px] !text-[40px]" />
            <p class="text-[--p-text-muted-color] text-center text-sm">
                Wähle ein Bild aus, um dein Profilbild zu ändern.
            </p>
            <Button
                label="Bild auswählen"
                icon="pi pi-image"
                @click="triggerFileInput"
                class="w-full max-w-[280px]"
            />
            <Button
                v-if="hasExistingImage"
                label="Profilbild entfernen"
                icon="pi pi-trash"
                severity="danger"
                text
                @click="deleteImage"
                :loading="uploading"
                class="w-full max-w-[280px]"
            />
            <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden"
                @change="onFileSelected"
            />
        </div>

        <!-- Step 2: Crop -->
        <div v-else-if="step === 'crop'" class="flex flex-col items-center gap-4">
            <div class="w-full overflow-hidden rounded-lg" style="max-height: 60vh;">
                <Cropper
                    ref="cropperRef"
                    :src="imageSrc"
                    :stencil-component="CircleStencil"
                    :stencil-props="{ aspectRatio: 1 }"
                    :resize-image="{ adjustStencil: false }"
                    image-restriction="stencil"
                    class="cropper"
                />
            </div>
            <div class="flex gap-3 w-full justify-end">
                <Button
                    label="Abbrechen"
                    severity="secondary"
                    text
                    @click="resetToSelect"
                    :disabled="uploading"
                />
                <Button
                    label="Speichern"
                    icon="pi pi-check"
                    @click="cropAndUpload"
                    :loading="uploading"
                />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import PlayerProfileAvatar from './PlayerProfileAvatar.vue';
import { getPlayerProfileImageFromBackend, invalidatePlayerProfileImageCache } from './PlayerProfileImageMapping';

const props = defineProps<{
    playerName: string;
    visible: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'uploaded'): void;
}>();

const toast = useToast();

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
});

const step = ref<'select' | 'crop'>('select');
const imageSrc = ref<string>('');
const uploading = ref(false);
const hasExistingImage = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);

// Check if player already has an uploaded image
watch(() => props.visible, async (visible) => {
    if (visible) {
        try {
            const existing = await getPlayerProfileImageFromBackend(props.playerName);
            hasExistingImage.value = !!existing;
        } catch {
            hasExistingImage.value = false;
        }
    }
});

const triggerFileInput = () => {
    fileInputRef.value?.click();
};

const onFileSelected = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
        toast.add({ severity: 'error', summary: 'Fehler', detail: 'Bitte wähle ein Bild (PNG, JPEG oder WebP)', life: 3000 });
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        toast.add({ severity: 'error', summary: 'Fehler', detail: 'Das Bild ist zu groß (max. 10MB)', life: 3000 });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imageSrc.value = e.target?.result as string;
        step.value = 'crop';
    };
    reader.readAsDataURL(file);

    // Reset file input so the same file can be selected again
    target.value = '';
};

const cropAndUpload = async () => {
    if (!cropperRef.value) return;

    uploading.value = true;
    try {
        const { canvas } = cropperRef.value.getResult();
        if (!canvas) {
            toast.add({ severity: 'error', summary: 'Fehler', detail: 'Bild konnte nicht zugeschnitten werden', life: 3000 });
            uploading.value = false;
            return;
        }

        // Resize to max 400x400 for optimal size
        const resizedCanvas = resizeCanvas(canvas, 400, 400);
        const imageData = resizedCanvas.toDataURL('image/jpeg', 0.85);

        await axios.post('/playerImages/upload', {
            playerName: props.playerName,
            imageData,
        });

        invalidatePlayerProfileImageCache(props.playerName);

        toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Profilbild wurde gespeichert', life: 3000 });
        emit('uploaded');
        dialogVisible.value = false;
    } catch {
        toast.add({ severity: 'error', summary: 'Fehler', detail: 'Profilbild konnte nicht gespeichert werden', life: 3000 });
    } finally {
        uploading.value = false;
    }
};

const deleteImage = async () => {
    uploading.value = true;
    try {
        await axios.delete(`/playerImages/delete/${encodeURIComponent(props.playerName)}`);
        invalidatePlayerProfileImageCache(props.playerName);
        hasExistingImage.value = false;

        toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Profilbild wurde entfernt', life: 3000 });
        emit('uploaded');
        dialogVisible.value = false;
    } catch {
        toast.add({ severity: 'error', summary: 'Fehler', detail: 'Profilbild konnte nicht entfernt werden', life: 3000 });
    } finally {
        uploading.value = false;
    }
};

const resetToSelect = () => {
    imageSrc.value = '';
    step.value = 'select';
};

const onDialogHide = () => {
    // Reset state when the dialog is closed
    step.value = 'select';
    imageSrc.value = '';
    uploading.value = false;
};

const resizeCanvas = (source: HTMLCanvasElement, maxWidth: number, maxHeight: number): HTMLCanvasElement => {
    const { width, height } = source;
    if (width <= maxWidth && height <= maxHeight) return source;

    const ratio = Math.min(maxWidth / width, maxHeight / height);
    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, newWidth, newHeight);

    return canvas;
};
</script>

<style scoped>
.cropper {
    min-height: 300px;
    max-height: 55vh;
}
</style>
