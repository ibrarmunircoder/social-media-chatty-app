#!/bin/bash

function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

if [ $(program_is_installed zip) == 0 ]; then
  sudo apt update -y
  sudo apt install zip -y
fi


aws s3 --profile test-user sync s3://chattyapp-env-files/production . # update with your s3 bucket
unzip env-file.zip
cp .env.production .env
rm .env.production
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.production
zip env-file.zip .env.production
aws --region us-east-1 --profile test-user s3 cp env-file.zip s3://chattyapp-env-files/production/ # update with your s3 bucket
rm -rf .env*
rm -rf env-file.zip
