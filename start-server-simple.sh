#!/bin/bash
PORT=8001
echo "🚀 Starting server on port $PORT"
echo "📝 Mở: http://localhost:$PORT/login.html"
python3 -m http.server $PORT
