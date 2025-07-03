
# 😃 Emotion Recognition System using CNN (VGG-style)

This project implements a **Facial Emotion Recognition (FER)** system using a Convolutional Neural Network inspired by the **VGG architecture**. The model is trained on the **FER-2013 dataset** and can classify images into five emotional categories: `angry`, `happy`, `neutral`, `sad`, and `surprise`.

---

## 🧠 Model Architecture

The system uses a **custom CNN** based on the VGG-16 architecture, featuring:

- 4 convolutional blocks (64 to 512 filters)
- Batch Normalization and ReLU activation
- MaxPooling after each block
- Two fully connected dense layers (4096 units each)
- Dropout (0.5) and L2 regularization
- Softmax output layer for multi-class classification

Optimizer: `SGD` with Nesterov Momentum  
Loss: `Categorical Crossentropy`  
Learning rate scheduler: `ReduceLROnPlateau`  
Early stopping: Based on validation accuracy

---

## 🧪 Emotion Classes

The system is trained to detect the following emotions:

- 😠 Angry
- 😀 Happy
- 😐 Neutral
- 😢 Sad
- 😮 Surprise

_*Disgust and Fear were removed from the original dataset*_
---

## 🚀 How to Run

### 1. Setup Environment

Install dependencies (file in `documentation/setup` directory):

```bash
pip install -r requirements_training.txt
```

**Requirements:**

- Python 3.10 (recommended)
- TensorFlow 2.10.1
- OpenCV
- NumPy
- Matplotlib, Seaborn
- Scikit-learn

### 2. Prepare Dataset

Ensure the FER-2013_5e dataset is structured as:

```
FER-2013_5e/
├── train/
├── val/
└── test/
```

Each folder should contain subdirectories named after the classes, each with grayscale 48x48 `.jpg` images.

### 3. Train the Model

Update the `basic_path` in the notebook if needed:

```python
config = {
    "basic_path" : "path/to/data-collection/FER-2013_5e/",
    ...
}
```

Run the notebook (file in `dev` directory):

```bash
pip install jupyter
jupyter notebook VGGnet_FER_5e.ipynb
```

Final model will be saved under the `training/` directory.

---

## 📊 Evaluation and Results

Metrics used:

- **Accuracy history** (train, validation)
- **Loss history** (train, validation)
- **Accuracy**, **Loss**, **Confusion Matrix**, **F1-Score**, and **Precision/Recall** (test)

After training, the notebook:

- Plots training and validation **accuracy/loss curves**
- Saves final model to:
  ```
  training/fer_vggnet_model.h5
  ```
- Evaluates model performance on the test set
- Displays test set confusion matrix and classification report

---

## 📌 Features

- ✅ Data Augmentation
- ✅ Grayscale input support (48x48)
- ✅ Custom VGG-like CNN
- ✅ Callback integration: EarlyStopping, ReduceLROnPlateau
- ✅ Automatic model checkpointing (best weights saved during training)

---

## 📚 Acknowledgements

- FER-2013 dataset: [Kaggle](https://www.kaggle.com/datasets/pankaj4321/fer-2013-facial-expression-dataset)
- Model inspired by VGGNet [(Khaireddin & Chen, 2021)](https://doi.org/10.48550/arxiv.2105.03588)

---

## 📝 License

This project is for educational and research use only. Commercial use requires explicit permission.

---

## 🌐 Related Projects

### **Frontend (Next.js)**
- **Name**: parla_ui
- **Description**: Interactive web interface for real-time emotion detection.

### **Backend (Flask API)**
- **Name**: flask_app
- **Description**: REST API serving the trained CNN model.

_For additional information, check the README files on `documentation/setup` directory_
