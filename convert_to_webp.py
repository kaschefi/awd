import os
import sys
from PIL import Image

def convert_to_webp(input_path, output_path=None, quality=80):
    """
    Converts a single image or an entire folder of images to WebP format.
    Prints the file size comparison (before vs after) and savings percentage.
    """
    if os.path.isfile(input_path):
        _convert_single_file(input_path, output_path, quality)
    elif os.path.isdir(input_path):
        _convert_directory(input_path, quality)
    else:
        print(f"Error: Path '{input_path}' does not exist.")

def _convert_single_file(file_path, output_path=None, quality=80):
    valid_exts = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')
    if not file_path.lower().endswith(valid_exts):
        print(f"Skipping non-image file: {file_path}")
        return

    if not output_path:
        base_name, _ = os.path.splitext(file_path)
        output_path = f"{base_name}.webp"

    try:
        with Image.open(file_path) as img:
            # Convert RGBA / P palette to RGB if needed for formats that don't support alpha,
            # but WebP fully supports both RGB and RGBA (transparency).
            img.save(output_path, "WEBP", quality=quality, method=6)
        
        orig_size = os.path.getsize(file_path)
        webp_size = os.path.getsize(output_path)
        reduction = (1 - (webp_size / orig_size)) * 100

        print(f"Converted: {os.path.basename(file_path)}")
        print(f"  Original : {orig_size / 1024:.2f} KB")
        print(f"  WebP     : {webp_size / 1024:.2f} KB  ({reduction:.1f}% smaller)\n")
    except Exception as e:
        print(f"Failed to convert '{file_path}': {e}")

def _convert_directory(dir_path, quality=80):
    valid_exts = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')
    total_orig = 0
    total_webp = 0
    count = 0

    print(f"Scanning directory: {dir_path}...\n")
    for root, _, files in os.walk(dir_path):
        for f in files:
            if f.lower().endswith(valid_exts):
                full_path = os.path.join(root, f)
                base_name, _ = os.path.splitext(full_path)
                webp_path = f"{base_name}.webp"
                
                _convert_single_file(full_path, webp_path, quality)
                
                if os.path.exists(webp_path):
                    total_orig += os.path.getsize(full_path)
                    total_webp += os.path.getsize(webp_path)
                    count += 1

    if count > 0:
        total_reduction = (1 - (total_webp / total_orig)) * 100
        print("=" * 45)
        print(f"Total images converted : {count}")
        print(f"Total Original Size    : {total_orig / 1024:.2f} KB")
        print(f"Total WebP Size        : {total_webp / 1024:.2f} KB")
        print(f"Total Bandwidth Saved  : {total_reduction:.1f}%")
        print("=" * 45)
    else:
        print("No matching image files found.")

if __name__ == "__main__":
    # If a path was passed as command-line argument, use it; otherwise default to ./assets
    target_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "assets")
    convert_to_webp(target_path)
