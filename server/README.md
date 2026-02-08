# Image Deepfake Detection

## Initial Approach

Attempted to train a SVM classifer using Fourier Transform.

Converting images into frequencies, representing content frequency. General shapes had low frequencies and edges/noise had high frequencies.

Training a model with 10k+ images is too resource intensive -> utilized Google Colab

Training Data: [Kaggle - Birdy654](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images)
~ 60k generated images and 60k real images

Krizhevsky, A., & Hinton, G. (2009). Learning multiple layers of features from tiny images.

Bird, J.J. and Lotfi, A., 2024. CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images. IEEE Access.

Real images are from Krizhevsky & Hinton (2009), fake images are from Bird & Lotfi (2024). The Bird & Lotfi study is available here.

Flaw: Images were restricted to 32x32; not suitable for flexible image analysis
