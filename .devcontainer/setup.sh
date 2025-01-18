#!/bin/bash
sudo apt update && sudo apt install -y \
    python3 \
    python3-distutils \
    build-essential \
    libgl1-mesa-dev \
    libxi-dev \
    libxmu-dev \
    libgles2-mesa-dev \
    libx11-dev \
    xvfb \
    && sudo ln -s /usr/bin/python3 /usr/bin/python
