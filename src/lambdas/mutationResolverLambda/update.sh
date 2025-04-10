#!/bin/bash

# Variables
LAMBDA_NAME="CorsaBackendStack-MutationResolverLambda8A1CE775-9l0WQ7cYlkdU"
DIST_FOLDER="dist"  # Folder where the built code resides
ZIP_FILE="lambda.zip"  # Temporary zip file name

# Navigate to the root directory
cd "$(dirname "$0")"

# Run build command
yarn build

# Create a zip file from the dist folder
zip -r $ZIP_FILE $DIST_FOLDER > /dev/null 2>&1  # Suppress output

# Update the Lambda function code
aws lambda update-function-code \
  --function-name $LAMBDA_NAME \
  --zip-file fileb://$ZIP_FILE > /dev/null 2>&1  # Suppress output
  --publish

# Clean up the zip file
rm $ZIP_FILE

echo "Lambda function $LAMBDA_NAME has been updated successfully!"