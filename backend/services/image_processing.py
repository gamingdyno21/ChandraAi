import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr

def calculate_metrics(original, processed):
    # Ensure images have the same shape for metrics
    if original.shape != processed.shape:
        try:
            processed = cv2.resize(processed, (original.shape[1], original.shape[0]))
        except Exception:
            return 0.0, 0.0

    # Calculate PSNR
    try:
        p = psnr(original, processed, data_range=255)
    except Exception:
        p = 0.0

    # Calculate SSIM (converting to grayscale is common for structural similarity, or setting channel_axis=2)
    try:
        s = ssim(original, processed, data_range=255, channel_axis=2)
    except Exception:
        s = 0.0

    return p, s

def process_image_cv(img, action, value):
    original_img = img.copy()
    processed_img = img.copy()

    if action == "brightness":
        # value expected between -100 to 100
        matrix = np.ones(img.shape, dtype="uint8") * abs(int(value))
        if value > 0:
            processed_img = cv2.add(img, matrix)
        else:
            processed_img = cv2.subtract(img, matrix)

    elif action == "contrast":
        # value expected between 0.1 to 3.0
        alpha = max(0.1, value)
        processed_img = cv2.convertScaleAbs(img, alpha=alpha, beta=0)

    elif action == "grayscale":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        processed_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    elif action == "histogram":
        # Histogram equalization requires YUV color space to equalize on lightness
        img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
        img_yuv[:,:,0] = cv2.equalizeHist(img_yuv[:,:,0])
        processed_img = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)

    elif action == "gaussian":
        # value could be filter size (must be odd)
        k = int(value)
        if k % 2 == 0:
            k += 1
        k = max(3, k)
        processed_img = cv2.GaussianBlur(img, (k, k), 0)

    elif action == "median":
        k = int(value)
        if k % 2 == 0:
            k += 1
        k = max(3, k)
        processed_img = cv2.medianBlur(img, k)

    elif action == "bilateral":
        # value could be d (diameter of pixel neighborhood)
        d = int(value)
        d = max(5, d)
        processed_img = cv2.bilateralFilter(img, d, 75, 75)

    elif action == "canny":
        # Threshold values can be derived or fixed
        edges = cv2.Canny(img, 100, 200)
        processed_img = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    elif action == "sobel":
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        abs_grad_x = cv2.convertScaleAbs(sobelx)
        abs_grad_y = cv2.convertScaleAbs(sobely)
        grad = cv2.addWeighted(abs_grad_x, 0.5, abs_grad_y, 0.5, 0)
        processed_img = cv2.cvtColor(grad, cv2.COLOR_GRAY2BGR)

    elif action == "deblur":
        # Wiener deconvolution in the frequency domain
        k = 5
        psf = np.zeros((k, k), dtype=np.float64)
        psf[k // 2, k // 2] = 1.0
        psf = cv2.GaussianBlur(psf, (k, k), 0)
        psf /= psf.sum()
        noise_var = 0.008
        restored = np.zeros_like(img, dtype=np.float64)
        for c in range(img.shape[2]):
            channel = img[:, :, c].astype(np.float64) / 255.0
            H = np.fft.fft2(psf, s=channel.shape)
            W = np.conj(H) / (np.abs(H) ** 2 + noise_var)
            F_est = np.fft.fft2(channel) * W
            restored[:, :, c] = np.clip(np.real(np.fft.ifft2(F_est)) * 255.0, 0, 255)
        processed_img = restored.astype(np.uint8)

    elif action == "sharpen":
        # Multi-level unsharp masking
        strength = max(0.5, float(value)) if value else 1.5
        blurred = cv2.GaussianBlur(img, (0, 0), 1.2)
        processed_img = cv2.addWeighted(img, 1.0 + strength, blurred, -strength, 0)

    elif action == "clahe":
        # Adaptive local contrast enhancement
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        processed_img = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)

    p, s = calculate_metrics(original_img, processed_img)
    return processed_img, p, s
