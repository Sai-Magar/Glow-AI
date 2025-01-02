from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import cv2
import numpy as np
from PIL import Image
from datetime import datetime
import uuid

app = Flask(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

SKIN_RECOMMENDATIONS = {
    'oily': {
        'products': ['Oil-Free Cleanser', 'Niacinamide Serum', 'Light Moisturizer', 'Clay Mask'],
        'routine': 'Morning: Cleanse, apply niacinamide serum, light moisturizer. Evening: Double cleanse, clay mask (2x/week), light moisturizer.'
    },
    'dry': {
        'products': ['Cream Cleanser', 'Hyaluronic Acid Serum', 'Rich Moisturizer', 'Face Oil'],
        'routine': 'Morning: Gentle cleanse, hyaluronic acid serum on damp skin, rich moisturizer. Evening: Cream cleanse, serum, moisturizer, face oil.'
    },
    'combination': {
        'products': ['Balanced Cleanser', 'BHA Toner', 'Gel Moisturizer', 'Balancing Serum'],
        'routine': 'Morning: Cleanse, BHA toner (T-zone), balancing serum, gel moisturizer. Evening: Double cleanse, serum, moisturize dry areas.'
    },
    'normal': {
        'products': ['Gentle Cleanser', 'Vitamin C Serum', 'Daily Moisturizer', 'SPF'],
        'routine': 'Morning: Cleanse, vitamin C serum, moisturizer, SPF. Evening: Cleanse, moisturize, treatment products as needed.'
    }
}

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_unique_filename(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    return f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}.{ext}"

def analyze_skin_type(img):
    try:
        # Convert to HSV color space
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Calculate average saturation and value
        avg_saturation = np.mean(hsv[:, :, 1])
        avg_value = np.mean(hsv[:, :, 2])
        
        # Simple classification logic
        if avg_saturation > 120:
            return 'oily'
        elif avg_value < 100:
            return 'dry'
        elif avg_saturation > 90:
            return 'combination'
        else:
            return 'normal'
    except Exception as e:
        print(f"Error in skin analysis: {str(e)}")
        return 'normal'  # default fallback

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if file and allowed_file(file.filename):
            filename = get_unique_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            file.save(filepath)

            try:
                # Read and analyze image
                img = cv2.imread(filepath)
                if img is None:
                    return jsonify({'error': 'Could not read image'}), 400
                
                skin_type = analyze_skin_type(img)
                results = {
                    'skin_type': skin_type,
                    'recommendations': SKIN_RECOMMENDATIONS[skin_type]
                }
                
                return jsonify(results)
            finally:
                # Clean up uploaded file
                if os.path.exists(filepath):
                    os.remove(filepath)

        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True) 