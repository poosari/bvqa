#!/bin/bash

# Base URL
BASE_URL="http://localhost:8080/api"

# File to upload
FILE_PATH="../../documents_in/bharathavamsavalienglish.pdf"

echo "Checking if backend is up..."
# Simple check if port 8080 is open (or use a health endpoint if available, but we'll just try upload)
# Sleep a bit to ensure startup
sleep 5

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: Test file not found at $FILE_PATH"
    exit 1
fi

echo "Uploading $FILE_PATH..."
UPLOAD_RESPONSE=$(curl -s -X POST -F "file=@$FILE_PATH" $BASE_URL/upload)
echo "Upload Response: $UPLOAD_RESPONSE"

DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$DOC_ID" ]; then
    echo "Error: Failed to get Document ID"
    exit 1
fi

echo "Document ID: $DOC_ID"

echo "Sending chat message..."
CHAT_PAYLOAD="{\"documentId\": \"$DOC_ID\", \"message\": \"Who are the Pandavas?\"}"
CHAT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$CHAT_PAYLOAD" $BASE_URL/chat)

echo "Chat Response: $CHAT_RESPONSE"
