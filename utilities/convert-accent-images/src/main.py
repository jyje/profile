import os
import cv2
import numpy as np

input_root_path = "../data/input"
output_root_path = "../data/output"

def main():
    # Read all images in the input folder
    input_list = os.listdir(input_root_path)

    for input_index, input_file in enumerate(input_list):
        # Read the image
        input_image = cv2.imread(os.path.join(input_root_path, input_file))

        # Convert the image to blur
        blurred_image = cv2.GaussianBlur(input_image, (5, 5), 0)

        # Darken the image
        darkened_image = cv2.convertScaleAbs(input_image, alpha=0.2, beta=0)

        # Combine the blurred and darkened image
        output_image = cv2.addWeighted(darkened_image, 0.5, blurred_image, 0.5, 0)

        # Save the final image
        cv2.imwrite(os.path.join(output_root_path, input_file), output_image)

        print(f"Image {input_index + 1}/{len(input_list)} converted.")

if __name__ == "__main__":
    main()
