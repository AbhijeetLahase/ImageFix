import torch
import torchvision.transforms as transforms
from PIL import Image
import os
import numpy as np

from BSRGAN.models.network_rrdbnet import RRDBNet

def enhance_image(input_path: str) -> str:
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Load image
    img = Image.open(input_path).convert('RGB')
    img_np = np.array(img).astype(np.float32) / 255.0
    img_np = torch.from_numpy(img_np).permute(2, 0, 1).unsqueeze(0).to(device)

    # Load model
    model = RRDBNet(in_nc=3, out_nc=3, nf=64, nb=23)
    model_path = os.path.join('BSRGAN', 'models', 'BSRGAN.pth')
    model.load_state_dict(torch.load(model_path, map_location=device), strict=True)
    model.eval()
    model = model.to(device)

    # Enhance image
    with torch.no_grad():
        output = model(img_np).data.squeeze().float().cpu().clamp_(0, 1)

    # Convert to PIL image and save
    output_image = transforms.ToPILImage()(output)
    base, ext = os.path.splitext(input_path)
    output_path = base + "_enhanced" + ext
    output_image.save(output_path)

    return output_path
