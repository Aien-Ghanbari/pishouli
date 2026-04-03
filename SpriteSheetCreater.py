import cv2
import io
import numpy as np
from PIL import Image
from rembg import remove

def _to_rgba_image(img_obj):
    """Normalize rembg output into a PIL RGBA image."""
    if isinstance(img_obj, Image.Image):
        return img_obj.convert('RGBA')
    if isinstance(img_obj, (bytes, bytearray)):
        return Image.open(io.BytesIO(img_obj)).convert('RGBA')
    raise TypeError(f"Unsupported image type returned by rembg: {type(img_obj)}")

def _find_bounding_boxes_from_alpha(rgba_img, min_area):
    cv_img = cv2.cvtColor(np.array(rgba_img), cv2.COLOR_RGBA2BGRA)
    alpha_channel = cv_img[:, :, 3]
    _, mask = cv2.threshold(alpha_channel, 10, 255, cv2.THRESH_BINARY)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > min_area:
            x, y, w, h = cv2.boundingRect(contour)
            boxes.append((x, y, w, h))
    return boxes

def _find_bounding_boxes_from_color(rgba_img, min_area):
    """Fallback mask for pixel art when alpha mask is empty."""
    rgb = np.array(rgba_img.convert('RGB'))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # Keep saturated colors (sprite colors) and very dark pixels (sprite outlines).
    sat_mask = (hsv[:, :, 1] > 35).astype(np.uint8) * 255
    dark_mask = (hsv[:, :, 2] < 70).astype(np.uint8) * 255
    mask = cv2.bitwise_or(sat_mask, dark_mask)

    # Remove tiny noise while preserving blocky pixel-art silhouettes.
    kernel = np.ones((2, 2), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > min_area:
            x, y, w, h = cv2.boundingRect(contour)
            if w >= 8 and h >= 8:
                boxes.append((x, y, w, h))
    return boxes

def _build_cat_foreground_mask(rgba_img):
    """Build a mask that keeps cat pixels and suppresses page/grid background."""
    rgb = np.array(rgba_img.convert('RGB'))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)

    # Orange fur tones in HSV.
    orange_mask = cv2.inRange(hsv, (5, 70, 40), (35, 255, 255))

    # Grow fur area so we can keep outlines/highlights close to fur.
    near_orange = cv2.dilate(orange_mask, np.ones((5, 5), np.uint8), iterations=1)

    # Dark outlines (black/brown) close to orange fur.
    dark_mask = cv2.inRange(hsv, (0, 0, 0), (180, 110, 85))
    dark_near_orange = cv2.bitwise_and(dark_mask, near_orange)

    # Light highlights close to fur.
    light_mask = cv2.inRange(hsv, (0, 0, 150), (180, 70, 255))
    light_near_orange = cv2.bitwise_and(light_mask, near_orange)

    mask = cv2.bitwise_or(orange_mask, dark_near_orange)
    mask = cv2.bitwise_or(mask, light_near_orange)

    # Fill tiny holes and remove pixel noise.
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    return mask

def _find_bounding_boxes_from_mask(mask, min_area, min_size=8):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > min_area:
            x, y, w, h = cv2.boundingRect(contour)
            if w >= min_size and h >= min_size:
                boxes.append((x, y, w, h))
    return boxes

def _apply_alpha_mask(rgba_img, alpha_mask):
    rgba = np.array(rgba_img.convert('RGBA'))
    rgba[:, :, 3] = alpha_mask
    return Image.fromarray(rgba, mode='RGBA')

def _make_crop_alpha_from_light_background(crop_img, min_component_area=8):
    """Build alpha by removing light low-saturation background in each crop."""
    rgb = np.array(crop_img.convert('RGB'))
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    # Light/gray background (paper + grid) becomes transparent.
    bg_mask = cv2.inRange(hsv, (0, 0, 170), (180, 45, 255))
    fg_mask = cv2.bitwise_not(bg_mask)

    # Remove tiny isolated noise while preserving pixel-art edges.
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))

    # Drop tiny disconnected alpha islands (usually grid/background speckles).
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask, connectivity=8)
    if num_labels > 1:
        cleaned = np.zeros_like(fg_mask)
        for label_id in range(1, num_labels):
            area = stats[label_id, cv2.CC_STAT_AREA]
            if area >= min_component_area:
                cleaned[labels == label_id] = 255
        fg_mask = cleaned

    # Close one pass to keep thin outlines connected after denoising.
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, np.ones((2, 2), np.uint8))
    return fg_mask

def _prepare_sprite_crop(raw_img, box, cell_size, min_component_area=8):
    """Crop sprite from raw image, remove local background, and fit into cell size."""
    x, y, w, h = box
    crop = raw_img.crop((x, y, x + w, y + h)).convert('RGBA')

    alpha = _make_crop_alpha_from_light_background(crop, min_component_area=min_component_area)
    crop_arr = np.array(crop)
    crop_arr[:, :, 3] = alpha
    crop = Image.fromarray(crop_arr, mode='RGBA')

    # Trim transparent borders after background removal.
    bbox = crop.getbbox()
    if bbox is not None:
        crop = crop.crop(bbox)

    w, h = crop.size
    if w == 0 or h == 0:
        return None

    # Scale to fit target cell, preserving aspect ratio and crisp pixel-art edges.
    scale = min(cell_size / float(w), cell_size / float(h))
    if scale <= 0:
        return None
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    if (new_w, new_h) != (w, h):
        crop = crop.resize((new_w, new_h), resample=Image.NEAREST)
    return crop

def _cluster_positions(values, k):
    data = np.array(values, dtype=np.float32).reshape(-1, 1)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 50, 0.2)
    _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_PP_CENTERS)

    centers = centers.flatten()
    order = np.argsort(centers)
    remap = {old_idx: new_idx for new_idx, old_idx in enumerate(order)}
    mapped_labels = [remap[int(label[0])] for label in labels]
    sorted_centers = centers[order]
    return mapped_labels, sorted_centers

def align_sprite_sheet(
    input_path,
    output_path,
    cell_size=32,
    y_tolerance=20,
    min_area=50,
    expected_frames=None,
    expected_cols=None,
    min_component_area=8
):
    print("1. Loading image...")
    raw_img = Image.open(input_path).convert('RGBA')
    effective_min_area = max(min_area, int(cell_size * cell_size * 0.25))

    print("2. Building foreground mask from sprite colors...")
    color_mask = _build_cat_foreground_mask(raw_img)
    color_boxes = _find_bounding_boxes_from_mask(color_mask, effective_min_area)

    source_image = raw_img
    bounding_boxes = color_boxes
    if bounding_boxes:
        print(f"Detected {len(bounding_boxes)} sprites using color-prioritized mask.")

    print("3. Trying background removal fallback if needed...")
    try:
        transparent_img = _to_rgba_image(remove(raw_img))
    except Exception as e:
        print(f"Warning: rembg failed ({e}). Falling back to color-based detection.")
        transparent_img = None

    if transparent_img is not None and not bounding_boxes:
        alpha_boxes = _find_bounding_boxes_from_alpha(transparent_img, effective_min_area)
        if alpha_boxes:
            bounding_boxes = alpha_boxes
            source_image = transparent_img
            print(f"Detected {len(bounding_boxes)} sprites using alpha mask.")

    if not bounding_boxes:
        print("Color-prioritized mask found no sprites. Trying legacy color fallback...")
        bounding_boxes = _find_bounding_boxes_from_color(raw_img, effective_min_area)
        source_image = raw_img
        print(f"Detected {len(bounding_boxes)} sprites using legacy color fallback.")

    if not bounding_boxes:
        print("No sprites detected!")
        return

    if expected_frames is not None and len(bounding_boxes) > expected_frames:
        print(f"Too many detected objects ({len(bounding_boxes)}). Keeping the {expected_frames} largest ones.")
        bounding_boxes = sorted(bounding_boxes, key=lambda b: b[2] * b[3], reverse=True)[:expected_frames]

    for (x, y, w, h) in bounding_boxes:
        if w > cell_size or h > cell_size:
            print(f"Notice: Sprite at ({x},{y}) is larger than {cell_size}x{cell_size}. It will be resized to fit.")

    print("4. Sorting frames into animation rows...")
    rows = []

    if expected_cols is not None and len(bounding_boxes) >= expected_cols:
        if expected_frames is not None and expected_frames >= expected_cols:
            expected_rows = max(1, expected_frames // expected_cols)
        else:
            expected_rows = max(1, int(np.ceil(len(bounding_boxes) / float(expected_cols))))

        y_centers = [y + (h / 2.0) for (x, y, w, h) in bounding_boxes]
        row_labels, _ = _cluster_positions(y_centers, expected_rows)

        row_map = {row_idx: [] for row_idx in range(expected_rows)}
        for box, row_idx in zip(bounding_boxes, row_labels):
            row_map[row_idx].append(box)

        for row_idx in range(expected_rows):
            row = row_map.get(row_idx, [])
            if row:
                if len(row) > expected_cols:
                    row = sorted(row, key=lambda b: b[2] * b[3], reverse=True)[:expected_cols]
                row.sort(key=lambda b: b[0])
                rows.append(row)
    else:
        # Sort all boxes by their Y coordinate first
        bounding_boxes.sort(key=lambda b: b[1])

        current_row = [bounding_boxes[0]]

        # Group boxes into rows based on y proximity.
        for box in bounding_boxes[1:]:
            if abs(box[1] - current_row[0][1]) <= y_tolerance:
                current_row.append(box)
            else:
                rows.append(current_row)
                current_row = [box]
        rows.append(current_row)

        # Sort each row horizontally (by X coordinate)
        for row in rows:
            row.sort(key=lambda b: b[0])

    print("5. Generating perfect grid...")
    num_rows = len(rows)
    max_cols = max(len(row) for row in rows)
    
    # Create the final perfect canvas
    perfect_sheet = Image.new('RGBA', (max_cols * cell_size, num_rows * cell_size), (0, 0, 0, 0))
    
    for row_idx, row in enumerate(rows):
        for col_idx, (x, y, w, h) in enumerate(row):
            cat_crop = _prepare_sprite_crop(
                source_image,
                (x, y, w, h),
                cell_size,
                min_component_area=min_component_area
            )
            if cat_crop is None:
                continue
            w, h = cat_crop.size
            
            # Calculate offsets for center-x and bottom-y alignment
            offset_x = (col_idx * cell_size) + ((cell_size - w) // 2)
            offset_y = (row_idx * cell_size) + (cell_size - h)
            
            # Paste the cat into the perfect grid
            perfect_sheet.paste(cat_crop, (offset_x, offset_y), cat_crop)

    # Save the result
    perfect_sheet.save(output_path)
    print(f"Success! Perfect sprite sheet saved to: {output_path}")
    print(f"Final dimensions: {max_cols * cell_size}x{num_rows * cell_size} pixels ({max_cols} columns, {num_rows} rows).")

# --- Execute the script ---
if __name__ == "__main__":
    # Replace 'ai_cats.jpg' with the actual name of your generated image
    input_filename = 'catsprite.png'
    output_filename = 'PerfectCatSpriteSheet.png'
    
    align_sprite_sheet(input_filename, output_filename, expected_frames=32, expected_cols=8)