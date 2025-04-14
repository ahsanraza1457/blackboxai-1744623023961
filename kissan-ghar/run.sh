#!/bin/bash
# Start backend server
cd backend && python3 app.py &
# Start frontend server
cd .. && python3 -m http.server 8000 &
# Open in browser
sleep 2
xdg-open "http://localhost:8000/index.html"
