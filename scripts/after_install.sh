#!/bin/bash

cd /home/ec2-user/social-media-chatty-app
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.develop
aws s3 sync s3://chattyapp-env-files/develop .
unzip env-file.zip
sudo cp .env.develop .env
sudo pm2 delete all
sudo npm install
