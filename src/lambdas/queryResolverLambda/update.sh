#!/bin/bash

set -e  # Stop script on any error

LAMBDA_NAME="CorsaBackendStack-QueryResolverLambda2B5DFEAA-wDtf0UWvStSW"
DIST_FOLDER="dist"
ZIP_FILE="lambda.zip"

cd "$(dirname "$0")"
yarn build

cd $DIST_FOLDER
zip -r ../$ZIP_FILE . > /dev/null 2>&1
cd ..

aws lambda update-function-code \
  --function-name $LAMBDA_NAME \
  --zip-file fileb://$ZIP_FILE > /dev/null 2>&1  # Suppress output
  --publish

rm $ZIP_FILE

echo "Lambda function $LAMBDA_NAME has been updated successfully!"
