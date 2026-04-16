# ChandraAi Image Enhancer

<div align="center">

![ChandraAi Banner](https://img.shields.io/badge/ChandraAi-Image%20Enhancer-8a64ff?style=for-the-badge&logo=sparkles&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![OpenCV](https://img.shields.io/badge/OpenCV-4.13-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)

**A full-stack AI-powered image enhancement and restoration system.**  
Combines classical Computer Vision with Deep Learning Super-Resolution.

</div>

---

## ✨ Features

### 🤖 AI Enhancement (5-Stage Pipeline)
| Stage | Technique | Effect |
|-------|-----------|--------|
| 1 | **Wiener Deconvolution** | Removes Gaussian & motion blur via FFT |
| 2 | **CLAHE** | Restores local contrast & hidden details |
| 3 | **Unsharp Masking** | Perceptual edge sharpening |
| 4 | **EDSR x4 Super-Resolution** | Deep-Learning 4× neural upscaling |
| 5 | **Detail Enhancement** | Final texture polish pass |

### 🎨 Classical Image Processing
- **Brightness** — Matrix-based linear intensity shift
- **Contrast** — Alpha scaling with `cv2.convertScaleAbs`
- **Grayscale** — Color space conversion
- **Histogram Equalization** — YUV-space adaptive lightness equalization
- **Gaussian Filter** — Configurable kernel noise smoothing
- **Median Filter** — Salt-and-pepper noise removal
- **Bilateral Filter** — Edge-preserving noise smoothing
- **Canny Edge Detection** — Gradient thresholding for feature extraction
- **Sobel Operator** — First-order derivative edge mask

### 📊 Quality Metrics
- **PSNR** (Peak Signal-to-Noise Ratio) — quantifies pixel-level noise
- **SSIM** (Structural Similarity Index) — structural preservation score

### 🖥️ UI/UX
- Drag-and-drop image upload
- Interactive **before/after comparison slider**
- Animated aurora gradient theme (Gemini-inspired)
- Fully **responsive** — desktop, tablet, and mobile
- Mobile slide-in tools drawer
- One-click **Export** of enhanced image

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, React-Bootstrap, Vanilla CSS |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Computer Vision** | OpenCV (`opencv-contrib-python`) |
| **AI Model** | EDSR x4 / FSRCNN x2 (OpenCV DNN SuperRes) |
| **Metrics** | scikit-image (PSNR, SSIM) |

---

## 📁 Project Structure

```
ChandraAi/
├── backend/
│   ├── main.py                  # FastAPI app & CORS config
│   ├── services/
│   │   ├── image_processing.py  # Classical CV operations
│   │   └── ai_model.py          # 5-stage AI enhancement pipeline
│   ├── models/                  # Auto-downloaded AI model weights
│   ├── venv/                    # Python virtual environment
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx        # Drag & drop upload
│   │   │   ├── Controls.jsx      # Tool buttons & sliders
│   │   │   └── ImagePreview.jsx  # Before/After comparison slider
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.jsx               # Main layout & state
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global premium CSS design
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.10

### 1. Clone the Repository

```bash
git clone https://github.com/gamingdyno21/ChandraAi.git
cd ChandraAi
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

> 💡 **Note:** On the first AI enhancement request, the backend will automatically download the **EDSR_x4.pb** model (~60MB). Ensure you have an internet connection.

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:8000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/process` | `POST` | Process an image with a selected action |
| `/docs` | `GET` | Interactive Swagger API documentation |

**Request format:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File | The image to process (JPG/PNG/WEBP) |
| `action` | string | One of: `brightness`, `contrast`, `grayscale`, `histogram`, `gaussian`, `median`, `bilateral`, `canny`, `sobel`, `deblur`, `sharpen`, `clahe`, `ai_enhance` |
| `value` | float | Numeric parameter for sliders (e.g. brightness amount) |

**Response Headers:**
- `X-PSNR` — Peak Signal-to-Noise Ratio of the result
- `X-SSIM` — Structural Similarity Index of the result

---

## 📦 Backend Dependencies

```
fastapi
uvicorn
opencv-contrib-python
scikit-image
python-multipart
numpy
scipy
```

Generate `requirements.txt`:
```bash
pip freeze > requirements.txt
```

---

## 📚 Algorithms Explained

### Wiener Deconvolution
Removes blur by estimating the original signal in the frequency domain using the inverse of the blur kernel (PSF), regularised by a noise variance factor to avoid amplifying noise.

### CLAHE (Contrast Limited Adaptive Histogram Equalization)
Unlike global histogram equalization, CLAHE divides the image into small tile regions and applies equalization locally, preventing over-amplification of noise.

### Unsharp Masking
Subtracts a blurred version of the image from the original — the difference (high-frequency detail) is added back at a controlled strength to sharpen edges.

### EDSR (Enhanced Deep Super-Resolution)
A residual convolutional neural network trained to reconstruct high-resolution images from low-resolution inputs. Uses OpenCV's DNN module with a frozen TensorFlow graph.

### PSNR & SSIM
- **PSNR** = 10 × log₁₀(MAX² / MSE) — measures pixel-level fidelity in decibels
- **SSIM** = weighted combination of luminance, contrast, and structure comparisons

---

## 🎓 Academic Alignment (VTU / Final Year)

This project demonstrates:
- ✅ Intensity Transformations (Brightness, Contrast, Histogram)
- ✅ Spatial Filtering (Gaussian, Median, Bilateral)
- ✅ Image Restoration (Wiener Deconvolution)
- ✅ Edge Detection (Canny, Sobel)
- ✅ AI-Based Enhancement (EDSR DNN Super-Resolution)
- ✅ Quality Evaluation (PSNR, SSIM metrics)

---

## 👨‍💻 Author

**Chandra** — [@gamingdyno21](https://github.com/gamingdyno21)

---

<div align="center">
  Made with ❤️ using React + FastAPI + OpenCV + Deep Learning
</div>
