#!/bin/bash

# Script to update the Minecraft bot: stop service, switch to bot-smartness-features, pull latest, restart service, check status

# Stop the service
sudo systemctl stop minecraftbot.service

# Navigate to the repo directory (adjust if needed)
cd /home/tourniquetrules/minecraftproject/aidev/projects/mc_agents

# Switch to the bot-smartness-features branch
git checkout bot-smartness-features

# Pull the latest changes from bot-smartness-features
git pull origin bot-smartness-features

# Start the service
sudo systemctl start minecraftbot.service

# Check status
sudo systemctl status minecraftbot.service