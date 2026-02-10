import os
import cv2
import joblib
import numpy as np
from sklearn.svm import OneClassSVM
from sklearn.decomposition import PCA

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.normpath(os.path.join(BASE_DIR, '..', 'data'))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'deepfake_detector_pca.pkl')

IMG_SIZE = 64

def load_data():
    data = []
    
    if not os.path.exists(DATA_FOLDER):
        print(f"Error: Folder not found at: {DATA_FOLDER}")
        
        return np.array([])
    
    print(f"Scanning for images in: {DATA_FOLDER}")
    
    valid_count = 0
    
    for file in os.listdir(DATA_FOLDER):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            path = os.path.join(DATA_FOLDER, file)
            
            try:
                img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                    data.append(img.flatten())
                    valid_count += 1
            except Exception as e:
                print(f"Skipping {file}: {e}")

    print(f"Loaded {valid_count} images.")
    
    return np.array(data)

def train():
    X_train = load_data()
    
    if X_train.size == 0 or len(X_train.shape) < 2:
        print("No images found. PCA cannot train on an empty dataset.")
        
        return

    X_train = X_train.astype(np.float32) / 255.0
 
    pca = PCA(n_components=min(len(X_train), 0.95)) 
    pca.fit(X_train)
    
    X_pca = pca.transform(X_train)
    clf = OneClassSVM(gamma='auto', nu=0.1)
    clf.fit(X_pca)
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump((pca, clf), MODEL_PATH)
    
    print(f"Model saved: {MODEL_PATH}")

def predict(image_path):
    if not os.path.exists(MODEL_PATH):
        return

    pca, clf = joblib.load(MODEL_PATH)
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    if img is None: 
        return f"Error: Could not read image at {image_path}"
    
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    flat = img.flatten().reshape(1, -1) / 255.0
    
    features = pca.transform(flat)
    prediction = clf.predict(features)
    
    reconstruction = pca.inverse_transform(features)
    error = np.mean((flat - reconstruction) ** 2)
    
    result = "REAL" if prediction[0] == 1 else "FAKE/ANOMALY"
    
    return f"Result: {result} (Error: {error:.5f})"

if __name__ == "__main__":
    train()

    test_img = os.path.join(BASE_DIR, "IMG_8432.jpg")