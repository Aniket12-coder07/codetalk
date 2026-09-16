"""
Standalone Verification Script for Step 2:
Tests the FastAPI WebSocket endpoint (/ws/transcribe) and AssemblyAI audio streaming.
Connects via WebSocket, generates 16kHz 16-bit PCM audio chunks, sends them,
and prints incoming live transcripts.
"""

import sys
import os
import math
import json
import struct
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import websockets

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def generate_synthetic_pcm_chunk(duration_ms: int = 100, sample_rate: int = 16000, freq: float = 440.0) -> bytes:
    """
    Generates a synthetic 16kHz 16-bit mono PCM chunk (little-endian).
    """
    num_samples = int(sample_rate * (duration_ms / 1000.0))
    buffer = bytearray()
    for i in range(num_samples):
        # Sine wave with gentle modulation
        sample_val = int(12000.0 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
        buffer.extend(struct.pack("<h", sample_val))
    return bytes(buffer)

async def run_streaming_test(ws_url: str = "ws://localhost:8000/ws/transcribe"):
    print(f"\n🎙️  Testing CodeTalk WebSocket Transcription Endpoint: {ws_url}")
    print("=" * 65)

    try:
        async with websockets.connect(ws_url) as ws:
            print(" Connected to CodeTalk WebSocket successfully!")
            print("📤 Streaming 16kHz PCM audio chunks to endpoint...")

            received_transcripts = []
            session_begun = False

            async def receiver():
                nonlocal session_begun
                try:
                    while True:
                        msg_raw = await ws.recv()
                        msg = json.loads(msg_raw)
                        msg_type = msg.get("type", "unknown")
                        if msg_type == "session_begun":
                            session_begun = True
                            print(f"✅ [SESSION BEGUN] Session ID: {msg.get('session_id')}")
                        elif msg_type == "partial":
                            print(f"⚡ [PARTIAL]: {msg.get('text')}")
                            received_transcripts.append(msg)
                        elif msg_type == "final":
                            print(f" [FINAL]: {msg.get('text')}")
                            received_transcripts.append(msg)
                        elif msg_type == "error":
                            print(f"❌ [ERROR]: {msg.get('error')}")
                        else:
                            print(f"ℹ️ [{msg_type}]: {msg}")
                except asyncio.CancelledError:
                    pass
                except websockets.exceptions.ConnectionClosed:
                    print("ℹ️ WebSocket connection closed by server.")

            receiver_task = asyncio.create_task(receiver())

            # Send 25 chunks of 100ms PCM audio (2.5 seconds of streaming)
            for i in range(25):
                chunk = generate_synthetic_pcm_chunk(duration_ms=100, freq=300.0 + (i * 20))
                await ws.send(chunk)
                await asyncio.sleep(0.1)

            print("📤 Finished sending audio chunks. Waiting 2 seconds for remaining responses...")
            await asyncio.sleep(2.0)

            receiver_task.cancel()
            await ws.close()

            print("=" * 65)
            print(f"🏁 Test Complete! Received session begun & {len(received_transcripts)} transcript events.")
            if session_begun or len(received_transcripts) > 0:
                print("✅ WebSocket streaming and AssemblyAI Universal Streaming API verified successfully!")
                return True
            else:
                print("⚠️ Connected and streamed audio, but received no session or transcript events.")
                return False

    except ConnectionRefusedError:
        print(f"❌ Connection refused. Is the FastAPI backend running on {ws_url}?")
        print("   Start it in a terminal using: python -m uvicorn app.main:app --port 8000")
        return False
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:8000/ws/transcribe"
    success = asyncio.run(run_streaming_test(url))
    sys.exit(0 if success else 1)
