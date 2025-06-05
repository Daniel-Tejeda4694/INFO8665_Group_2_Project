
# 😃 Emotion Recognition System using CNN (VGG-style)

This project implements a **Facial Emotion Recognition (FER)** system using a Convolutional Neural Network inspired by the **VGG architecture**. The model is trained on the **FER-2013 dataset** and can classify images into five emotional categories: `angry`, `happy`, `neutral`, `sad`, and `surprise`.

---

## 📁 Project Structure

```
Emotion_Recognition/
│
├── models/                    # Trained model storage
│   └── fer_vggnet_model.h5
├── FER-2013_5e/               # Dataset root directory
│   ├── train/
│   ├── val/
│   └── test/
├── emotion_recognition.py    # Main training script
└── README.md                 # Project documentation
```

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

---

## 🚀 How to Run

### 1. Setup Environment

Install dependencies:

```bash
pip install tensorflow opencv-python numpy pandas matplotlib seaborn scikit-learn pillow
```

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

Update the `basic_path` in the script if needed:

```python
config = {
    "basic_path" : "path/to/FER-2013_5e/",
    ...
}
```

Run the script:

```bash
python emotion_recognition.py
```

Model checkpoints and final model will be saved under the `models/` directory.

---

## 📊 Output

After training, the script:

- Plots training and validation **accuracy/loss curves**
- Evaluates model performance on the test set
- Saves final model to:
  ```
  models/fer_vggnet_model.h5
  ```

Example output:
```
Test Accuracy: 0.8235
```

---

## 📈 Visualizations

The script automatically plots training curves using `matplotlib`.

---

## 📌 Features

- ✅ Data Augmentation
- ✅ Grayscale input support (48x48)
- ✅ Custom VGG-like CNN
- ✅ Callback integration: EarlyStopping, ReduceLROnPlateau
- ✅ Modular design with reusable model builder
- ✅ Easy customization for new datasets or class labels

---

## 🧪 Evaluation Metrics

- **Accuracy** (train, validation, test)
- **Loss**
- Future extension: `Confusion Matrix`, `F1-Score`, `Precision/Recall` (via `classification_report`)

---

## 📎 Requirements

- Python 3.7+
- TensorFlow 2.x
- OpenCV
- NumPy, Pandas
- Matplotlib, Seaborn
- Scikit-learn

---

## 📬 Future Work

- Integrate with a **webcam Streamlit UI**
- Export predictions to a dashboard
- Add **confusion matrix visualization**
- Perform real-time inference and deployment on edge devices

---

## 📚 Acknowledgements

- FER-2013 dataset: [Kaggle](https://www.kaggle.com/datasets/msambare/fer2013)
- Model inspired by VGGNet (Simonyan & Zisserman, 2015)

---

## 📝 License

This project is for educational and research use only.
