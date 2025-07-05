# Use an official Python base image with Node.js preinstalled
FROM node:18-bullseye-slim as base

# Set working directory
WORKDIR /app

# Copy backend and frontend code
COPY . .

# ============ PYTHON BACKEND SETUP =============
# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    pip3 install --upgrade pip && \
    pip3 install -r ../documentation/setup/requirements_backend.txt

# ============ FRONTEND BUILD (Next.js + Tailwind) =============
WORKDIR /app/parla_ui

# Install frontend dependencies
RUN npm install

# Build the frontend
RUN npm run build

# ============ FINAL SETUP =============
# Go back to main app directory
WORKDIR /app

# Expose Flask backend port
EXPOSE 5000

# You can optionally expose 3000 if you want to run the Next.js dev server
# EXPOSE 3000

# Start the Flask backend (adjust if your app has different entrypoint)
CMD ["python3", "flask_app.py"]