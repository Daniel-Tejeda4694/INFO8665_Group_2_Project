import csv
import os

LOG_FILE = "emotion_logs.csv"

# Create CSV with headers if it doesn't exist
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        #writer.writerow(["email", "room_id", "emotion", "timestamp"])
        writer.writerow(["emotion", "timestamp"])

#def log_emotion(email, room_id, emotion, timestamp):
def log_emotion(emotion, timestamp):
    with open(LOG_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        # writer.writerow([email, room_id, emotion, timestamp])
        writer.writerow([emotion, timestamp])