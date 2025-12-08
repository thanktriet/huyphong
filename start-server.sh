#!/bin/bash

# =======================================================
# Start Local Development Server
# =======================================================

PORT=8000

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT đang được sử dụng"
    echo "   Đang thử port 8001..."
    PORT=8001
    
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Port $PORT cũng đang được sử dụng"
        echo "   Đang thử port 8002..."
        PORT=8002
    fi
fi

echo "🚀 Starting local server on port $PORT..."
echo ""
echo "📝 Note: Supabase requires HTTPS or localhost"
echo "   Mở browser và truy cập: http://localhost:$PORT/login.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✅ Using Python 2"
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Python not found. Please install Python 3"
    exit 1
fi

