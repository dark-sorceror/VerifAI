import os
import cv2
import numpy as np
import joblib
from pathlib import Path
from sklearn.svm import SVC
from scipy.fftpack import fft2, fftshift
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

MODEL_PATH = Path("../model/")

def extract_fft_features(file_path):
    # Grayscale and Standardize
    img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    
    if img is None: return None
    
    img = cv2.resize(img, (256, 256))

    # Convert to Fast Fourier Frequency Domain
    f_shift = fftshift(fft2(img))
    magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-9)

    h, w = magnitude_spectrum.shape
    center = (h // 2, w // 2)
    y, x = np.indices((h, w))
    r = np.sqrt((x - center[0])**2 + (y - center[1])**2).astype(int)
    
    tbin = np.bincount(r.ravel(), magnitude_spectrum.ravel())
    nr = np.bincount(r.ravel())
    radial_profile = tbin / nr
    
    return radial_profile[:128]

def load_dataset(data_dir):
    X, y = [], []
    categories = {'real': 0, 'fake': 1}
    
    for label_name, label_idx in categories.items():
        folder = os.path.join(data_dir, label_name)
        
        print(f"Loading {label_name}...")
        
        for filename in os.listdir(folder):
            path = os.path.join(folder, filename)
            features = extract_fft_features(path)
            
            if features is not None:
                X.append(features)
                y.append(label_idx)
    
    return np.array(X), np.array(y)

if __name__ == "__main__":
    X, y = load_dataset("../data/")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    print("Training SVM...")
    
    # Support Vector Machine
    clf = SVC(kernel = 'rbf', probability=True, C = 1.0, gamma = 'scale')
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    
    print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print(classification_report(y_test, y_pred))

    joblib.dump(clf, f"{MODEL_PATH}/deepfake_fft_model.pkl")
    
    print(f"Model saved: {MODEL_PATH}/deepfake_fft_model.pkl")