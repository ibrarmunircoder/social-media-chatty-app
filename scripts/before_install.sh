#!/bin/bash

DIT="/home/ec2-user/social-media-chatty-app"
if [ -d "$DIR" ]; then
  cd /home/ec2-user
  sudo rm -rf social-media-chatty-app
else
  echo "Directory does not exist"
fi
