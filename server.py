#!/usr/bin/env python3
"""
Simple HTTP server for local development of Pixel82.
Serves static files from the current directory.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers for better local development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def main():
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"╔════════════════════════════════════════════════╗")
        print(f"║          Pixel82 Development Server           ║")
        print(f"╠════════════════════════════════════════════════╣")
        print(f"║  Server running at: http://localhost:{PORT}    ║")
        print(f"║  Press Ctrl+C to stop the server              ║")
        print(f"╚════════════════════════════════════════════════╝")
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
