from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import cv2
import numpy as np
import io

from services.image_processing import process_image_cv
from services.ai_model import enhance_image_ai

app = FastAPI(title="AI Image Enhancer API")

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-PSNR", "X-SSIM"],
)

@app.post("/process")
async def process_image(
    file: UploadFile = File(...),
    action: str = Form(...),
    value: float = Form(0.0)
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        processed_img = None
        psnr = 0.0
        ssim_val = 0.0

        if action in ["brightness", "contrast", "gaussian", "median", "bilateral", "canny", "sobel", "histogram", "grayscale", "deblur", "sharpen", "clahe"]:
            processed_img, psnr, ssim_val = process_image_cv(img, action, value)
        elif action == "ai_enhance":
            processed_img, psnr, ssim_val = enhance_image_ai(img)
        else:
            raise HTTPException(status_code=400, detail="Invalid action")

        # Encode image to jpg
        _, encoded_img = cv2.imencode('.jpg', processed_img)
        
        headers = {
            "X-PSNR": f"{psnr:.2f}",
            "X-SSIM": f"{ssim_val:.4f}"
        }
        
        return Response(content=encoded_img.tobytes(), media_type="image/jpeg", headers=headers)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
