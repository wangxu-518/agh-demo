#!/usr/bin/env python3
"""Static file server with Vue history-mode fallback."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import os


class SPAHandler(SimpleHTTPRequestHandler):
    def _fallback(self):
        requested = Path(self.translate_path(self.path.split("?", 1)[0]))
        if not requested.exists() and "." not in requested.name:
            self.path = "/index.html"

    def do_GET(self):
        self._fallback()
        return super().do_GET()

    def do_HEAD(self):
        self._fallback()
        return super().do_HEAD()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8789)
    parser.add_argument("--directory", required=True)
    args = parser.parse_args()
    os.chdir(args.directory)
    ThreadingHTTPServer((args.host, args.port), SPAHandler).serve_forever()


if __name__ == "__main__":
    main()
