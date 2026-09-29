import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

export async function createImageFormData(uri) {
    if (typeof uri !== 'string' || !uri) {
        throw new Error('Please select a photo before uploading.');
    }

    let file;
    if (Platform.OS === 'web') {
        const response = await globalThis.fetch(uri);
        if (!response.ok) throw new Error('Cannot read this photo. Please select it again.');
        file = await response.blob();
    } else {
        file = new File(uri);
        if (!file.exists) throw new Error('This photo is no longer available. Please select it again.');
    }

    if (!file.size) throw new Error('This photo is empty. Please select another photo.');
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('This photo is larger than 10 MB. Please select a smaller photo.');
    }

    const extension = uri.split(/[?#]/)[0].split('.').pop().toLowerCase();
    let type = file.type || ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' })[extension];
    if (type === 'image/jpg') type = 'image/jpeg';
    if (!['image/jpeg', 'image/png'].includes(type)) {
        throw new Error('Please select a JPEG or PNG photo.');
    }

    const formData = new FormData();
    // Send readable file bytes, rather than React Native's URI-only descriptor.
    const body = file.type === type ? file : file.slice(0, file.size, type);
    formData.append('file', body, type === 'image/png' ? 'photo.png' : 'photo.jpg');
    return formData;
}

export const uploadImage = (url, body, headers = {}) => expoFetch(url, {
    method: 'POST',
    body,
    headers,
});
