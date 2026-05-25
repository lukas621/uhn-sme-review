#!/bin/bash
# Start SME Review App with local server
# Serves both the review app AND the course files

PORT=8080
COURSE_DIR="/Users/yijin/Documents/New Company Claude/UHN Accessibility Course/05-build-output/01-Foundations-of-Disability-Inclusion-and-Accessible-Design/04-course/current"
REVIEW_DIR="$(cd "$(dirname "$0")" && pwd)"

# Create a temp directory that links both
SERVE_DIR=$(mktemp -d)
ln -s "$REVIEW_DIR" "$SERVE_DIR/review"
ln -s "$COURSE_DIR" "$SERVE_DIR/course"

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║   UHN SME Review App                      ║"
echo "  ║                                           ║"
echo "  ║   Review:    http://localhost:$PORT/review/  ║"
echo "  ║   Dashboard: http://localhost:$PORT/review/dashboard.html ║"
echo "  ║   Course:    http://localhost:$PORT/course/  ║"
echo "  ║                                           ║"
echo "  ║   Press Ctrl+C to stop                    ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

# Open in browser
open "http://localhost:$PORT/review/"

# Start server
cd "$SERVE_DIR" && python3 -m http.server $PORT

# Cleanup on exit
rm -rf "$SERVE_DIR"
