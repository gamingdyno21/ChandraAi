import cv2
import os
import numpy as np
import urllib.request
from services.image_processing import calculate_metrics

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

# ----- Model Configs -----
EDSR_PATH = os.path.join(MODEL_DIR, "EDSR_x4.pb")
EDSR_URL  = "https://github.com/Saafke/EDSR_Tensorflow/raw/master/models/EDSR_x4.pb"

FSRCNN_PATH = os.path.join(MODEL_DIR, "FSRCNN_x2.pb")
FSRCNN_URL  = "https://github.com/Saafke/FSRCNN_Tensorflow/raw/master/models/FSRCNN_x2.pb"


def _download(path, url):
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
    if not os.path.exists(path):
        print(f"Downloading model: {os.path.basename(path)} ...")
        try:
            urllib.request.urlretrieve(url, path)
            print(f"Downloaded: {os.path.basename(path)}")
        except Exception as e:
            print(f"Download failed for {os.path.basename(path)}: {e}")


# Pre-download both on startup
_download(EDSR_PATH, EDSR_URL)
_download(FSRCNN_PATH, FSRCNN_URL)


# ─────────────────────────────────────────────────────────────────
#  STAGE 1: Classical deblur — Wiener-style deconvolution via FFT
# ─────────────────────────────────────────────────────────────────
def _wiener_deblur(img: np.ndarray, k: int = 5, noise_var: float = 0.01) -> np.ndarray:
    """
    Fast Wiener deconvolution in frequency domain.
    Assumes the blur is Gaussian with kernel size k.
    """
    # Build Gaussian PSF
    psf = np.zeros((k, k), dtype=np.float64)
    psf[k // 2, k // 2] = 1.0
    psf = cv2.GaussianBlur(psf, (k, k), 0)
    psf /= psf.sum()

    result = np.zeros_like(img, dtype=np.float64)
    for c in range(img.shape[2]):
        channel = img[:, :, c].astype(np.float64) / 255.0
        H       = np.fft.fft2(psf, s=channel.shape)
        H_conj  = np.conj(H)
        G       = np.fft.fft2(channel)
        # Wiener filter
        W       = H_conj / (np.abs(H) ** 2 + noise_var)
        F_est   = G * W
        restored = np.real(np.fft.ifft2(F_est))
        result[:, :, c] = np.clip(restored * 255.0, 0, 255)

    return result.astype(np.uint8)


# ─────────────────────────────────────────────────────────────────
#  STAGE 2: CLAHE — local contrast / detail recovery
# ─────────────────────────────────────────────────────────────────
def _apply_clahe(img: np.ndarray) -> np.ndarray:
    lab   = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    cl    = clahe.apply(l)
    merged = cv2.merge((cl, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


# ─────────────────────────────────────────────────────────────────
#  STAGE 3: Unsharp Masking — perceptual sharpening
# ─────────────────────────────────────────────────────────────────
def _unsharp_mask(img: np.ndarray, sigma: float = 1.2,
                  strength: float = 1.4) -> np.ndarray:
    blurred = cv2.GaussianBlur(img, (0, 0), sigma)
    sharp   = cv2.addWeighted(img, 1.0 + strength, blurred, -strength, 0)
    return sharp


# ─────────────────────────────────────────────────────────────────
#  STAGE 4: EDSR x4 Super-Resolution via OpenCV DNN
# ─────────────────────────────────────────────────────────────────
def _edsr_upscale(img: np.ndarray) -> np.ndarray:
    if not os.path.exists(EDSR_PATH):
        # fallback: FSRCNN x2
        if os.path.exists(FSRCNN_PATH):
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel(FSRCNN_PATH)
            sr.setModel("fsrcnn", 2)
            return sr.upsample(img)
        return img  # no model at all

    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(EDSR_PATH)
    sr.setModel("edsr", 4)  # EDSR x4 — much better than FSRCNN
    return sr.upsample(img)


# ─────────────────────────────────────────────────────────────────
#  STAGE 5: Detail-preserving final polish
# ─────────────────────────────────────────────────────────────────
def _detail_enhance(img: np.ndarray) -> np.ndarray:
    return cv2.detailEnhance(img, sigma_s=10, sigma_r=0.12)


# ─────────────────────────────────────────────────────────────────
#  PUBLIC: Full Enhancement Pipeline
# ─────────────────────────────────────────────────────────────────
def enhance_image_ai(img: np.ndarray):
    """
    Multi-stage AI + Classical Enhancement Pipeline:
      1. Wiener deconvolution  → removes Gaussian/motion blur
      2. CLAHE                 → restores local contrast & texture
      3. Unsharp masking       → perceptual edge sharpening
      4. EDSR x4 upscale       → deep-learning super-resolution
      5. Detail enhance        → final texture polish
    """
    original_img = img.copy()

    try:
        # ── Stage 1: Deblur ──
        print("[AI Pipeline] Stage 1: Wiener deblur...")
        deblurred = _wiener_deblur(img, k=5, noise_var=0.008)

        # ── Stage 2: CLAHE ──
        print("[AI Pipeline] Stage 2: CLAHE contrast recovery...")
        contrast_fixed = _apply_clahe(deblurred)

        # ── Stage 3: Unsharp Mask ──
        print("[AI Pipeline] Stage 3: Unsharp masking...")
        sharpened = _unsharp_mask(contrast_fixed, sigma=1.0, strength=1.2)

        # ── Stage 4: EDSR Super-Resolution ──
        print("[AI Pipeline] Stage 4: EDSR x4 super-resolution...")
        upscaled = _edsr_upscale(sharpened)

        # ── Stage 5: Detail Enhancement ──
        print("[AI Pipeline] Stage 5: Detail polish...")
        final = _detail_enhance(upscaled)

        # Metrics: compare naive bilinear resize vs AI pipeline
        h, w = final.shape[:2]
        naive = cv2.resize(original_img, (w, h), interpolation=cv2.INTER_LINEAR)
        p, s = calculate_metrics(naive, final)

        print(f"[AI Pipeline] Done. PSNR={p:.2f}dB  SSIM={s:.4f}")
        return final, p, s

    except Exception as e:
        print(f"[AI Pipeline] Error: {e}")
        # Graceful fallback — still apply classical stages only
        try:
            result = _wiener_deblur(img, k=5, noise_var=0.008)
            result = _apply_clahe(result)
            result = _unsharp_mask(result)
            p, s = calculate_metrics(original_img, result)
            return result, p, s
        except Exception as e2:
            print(f"[AI Pipeline] Fallback also failed: {e2}")
            return img, 0.0, 0.0
