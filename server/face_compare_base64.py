import sys
import base64
import json
from deepface import DeepFace
import cv2
import numpy as np

def decode_base64_image(base64_string):
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",", 1)[1]
        image_data = base64.b64decode(base64_string)
        np_arr = np.frombuffer(image_data, np.uint8)
        return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception as e:
        raise ValueError(f"Failed to decode image: {e}")

try:
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())

    img1 = decode_base64_image(input_data["stored"])
    img2 = decode_base64_image(input_data["input"])

    # Perform verification
    result = DeepFace.verify(img1_path=img1, img2_path=img2,enforce_detection=False,model_name='Facenet')

    if result["verified"]:
        print("True")
    else:
        print("False")

except Exception as e:
    print(f"error: {str(e)}", file=sys.stderr)


# img1 = "1.jpg"
# img2 = "2.jpg"
# img3 = "3.jpg"

# model_name = "Facenet"

# resp = DeepFace.verify(img1, img2, model_name=model_name)

# print(resp['verified'])