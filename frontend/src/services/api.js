import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const processImage = async (file, action, value = 0.0) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    formData.append('value', value);

    try {
        const response = await axios.post(`${API_BASE_URL}/process`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob', // Expecting an image file back
        });

        // Extract Metrics from Headers
        const psnr = response.headers['x-psnr'];
        const ssim = response.headers['x-ssim'];

        // Convert blob to Object URL
        const imageBlob = response.data;
        const imageUrl = URL.createObjectURL(imageBlob);

        return {
            imageUrl,
            metrics: { psnr, ssim }
        };
    } catch (error) {
        console.error("Error processing image API:", error);
        throw error;
    }
};
