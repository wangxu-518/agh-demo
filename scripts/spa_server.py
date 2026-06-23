#!/usr/bin/env python3
"""Static file server with Vue history-mode fallback."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import json
import os
import time


FEEDBACK_TYPES = {"建议", "问题", "不理解", "希望新增"}
FEEDBACK_PRIORITIES = {"一般", "重要", "紧急"}
FEEDBACK_FILE = Path(os.environ.get("AGH_FEEDBACK_FILE", "/opt/agh-demo-demo/data/feedback.jsonl"))
MAX_FEEDBACK_BYTES = 24 * 1024


class SPAHandler(SimpleHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0 or length > MAX_FEEDBACK_BYTES:
            raise ValueError("invalid_body_size")
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def _handle_feedback_post(self):
        try:
            payload = self._read_json_body()
        except (ValueError, json.JSONDecodeError):
            return self._send_json(400, {"ok": False, "error": "invalid_json"})

        content = str(payload.get("content") or "").strip()
        item = {
            "id": f"{int(time.time() * 1000)}-{os.getpid()}",
            "type": payload.get("type"),
            "priority": payload.get("priority"),
            "content": content,
            "name": str(payload.get("name") or "").strip()[:80],
            "phone": str(payload.get("phone") or "").strip()[:40],
            "phoneMasked": str(payload.get("phoneMasked") or "").strip()[:40],
            "path": str(payload.get("path") or "").strip()[:300],
            "system": str(payload.get("system") or "").strip()[:80],
            "submittedAt": str(payload.get("submittedAt") or "").strip()[:80],
            "userAgent": str(payload.get("userAgent") or "").strip()[:500],
            "receivedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

        if item["type"] not in FEEDBACK_TYPES:
            return self._send_json(400, {"ok": False, "error": "invalid_type"})
        if item["priority"] not in FEEDBACK_PRIORITIES:
            return self._send_json(400, {"ok": False, "error": "invalid_priority"})
        if len(content) < 5 or len(content) > 1000:
            return self._send_json(400, {"ok": False, "error": "invalid_content"})

        FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
        with FEEDBACK_FILE.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")
        return self._send_json(200, {"ok": True, "id": item["id"]})

    def _handle_feedback_get(self):
        items = []
        if FEEDBACK_FILE.exists():
            with FEEDBACK_FILE.open("r", encoding="utf-8") as handle:
                for line in handle:
                    try:
                        items.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
        items = list(reversed(items[-200:]))
        return self._send_json(200, {"ok": True, "items": items})

    def _fallback(self):
        requested = Path(self.translate_path(self.path.split("?", 1)[0]))
        if not requested.exists() and "." not in requested.name:
            self.path = "/index.html"

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/feedback":
            return self._handle_feedback_get()
        self._fallback()
        return super().do_GET()

    def do_POST(self):
        if self.path.split("?", 1)[0] == "/api/feedback":
            return self._handle_feedback_post()
        return self._send_json(404, {"ok": False, "error": "not_found"})

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
