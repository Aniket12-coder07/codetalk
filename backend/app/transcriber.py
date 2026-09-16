"""
AssemblyAI Real-Time Universal Streaming Speech-to-Text Bridge (v3 API)
Handles WebSocket streaming to AssemblyAI Universal Streaming API
with thread-safe asyncio message queuing and graceful fallback simulation.
"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any

from assemblyai.streaming.v3 import (
    RealTimeTranscriber,
    RealTimeEvents,
    RealTimeParameters,
    BeginEvent,
    TurnEvent,
    RealTimeError,
    TerminationEvent,
)

logger = logging.getLogger("codetalk.transcriber")

class AssemblyAITranscriberBridge:
    def __init__(
        self,
        loop: asyncio.AbstractEventLoop,
        transcript_queue: asyncio.Queue,
        sample_rate: int = 16000,
        api_key: Optional[str] = None,
    ):
        self.loop = loop
        self.queue = transcript_queue
        self.sample_rate = sample_rate
        self.api_key = api_key or os.getenv("ASSEMBLYAI_API_KEY", "").strip()
        self.transcriber: Optional[RealTimeTranscriber] = None
        self.is_connected = False
        self.mock_mode = False

        # Determine if valid API key is present
        if not self.api_key or self.api_key.startswith("your_") or len(self.api_key) < 10:
            logger.warning(
                "AssemblyAI API key not detected or is a placeholder. Enabling mock simulation mode for testing."
            )
            self.mock_mode = True

    def _on_begin(self, *args, **kwargs):
        event = args[-1] if args else kwargs.get("event")
        session_id = getattr(event, "id", "unknown-session")
        logger.info(f"AssemblyAI Universal Streaming session begun: {session_id}")
        self.loop.call_soon_threadsafe(
            self.queue.put_nowait,
            {
                "type": "session_begun",
                "session_id": str(session_id),
            },
        )

    def _on_turn(self, *args, **kwargs):
        event = args[-1] if args else kwargs.get("event")
        text = getattr(event, "transcript", "")
        if not text:
            return

        is_final = bool(getattr(event, "end_of_turn", False))
        logger.debug(f"AssemblyAI turn ({'FINAL' if is_final else 'PARTIAL'}): {text}")

        msg: Dict[str, Any] = {
            "type": "final" if is_final else "partial",
            "text": text,
        }

        # Include confidence or word details if available
        confidence = getattr(event, "end_of_turn_confidence", None)
        if confidence is not None:
            msg["confidence"] = confidence

        words = getattr(event, "words", None)
        if words:
            msg["words"] = [
                {
                    "text": getattr(w, "word", getattr(w, "text", "")),
                    "start": getattr(w, "start", 0),
                    "end": getattr(w, "end", 0),
                    "confidence": getattr(w, "confidence", 1.0),
                }
                for w in words
            ]

        self.loop.call_soon_threadsafe(self.queue.put_nowait, msg)

    def _on_error(self, *args, **kwargs):
        event = args[-1] if args else kwargs.get("event")
        logger.error(f"AssemblyAI RealTimeError: {event}")
        self.loop.call_soon_threadsafe(
            self.queue.put_nowait,
            {
                "type": "error",
                "error": str(event),
            },
        )

    def _on_termination(self, *args, **kwargs):
        logger.info("AssemblyAI session terminated.")
        self.loop.call_soon_threadsafe(
            self.queue.put_nowait,
            {
                "type": "session_closed",
            },
        )

    def connect(self):
        """Initializes and connects to the AssemblyAI Realtime service."""
        if self.mock_mode:
            logger.info("Running in Mock Mode - simulated connection established.")
            self.is_connected = True
            self.loop.call_soon_threadsafe(
                self.queue.put_nowait,
                {
                    "type": "session_begun",
                    "session_id": "mock-session-test-mode",
                    "note": "Running in mock simulation mode (no API key required).",
                },
            )
            return

        try:
            self.transcriber = RealTimeTranscriber(api_key=self.api_key)
            self.transcriber.on(RealTimeEvents.Begin, self._on_begin)
            self.transcriber.on(RealTimeEvents.Turn, self._on_turn)
            self.transcriber.on(RealTimeEvents.Error, self._on_error)
            self.transcriber.on(RealTimeEvents.Termination, self._on_termination)

            logger.info("Connecting to AssemblyAI Universal Streaming API...")
            params = RealTimeParameters(
                sample_rate=self.sample_rate,
                include_partial_turns=True,
            )
            self.transcriber.connect(params)
            self.is_connected = True
        except Exception as e:
            logger.error(f"Failed to connect to AssemblyAI: {e}")
            raise e

    def stream_chunk(self, audio_data: bytes):
        """Streams a raw PCM audio chunk to AssemblyAI."""
        if not self.is_connected:
            raise RuntimeError("Transcriber is not connected. Call connect() first.")

        if self.mock_mode:
            self._simulate_mock_chunk(audio_data)
            return

        if self.transcriber:
            self.transcriber.stream(audio_data)

    def _simulate_mock_chunk(self, audio_data: bytes):
        """Mock simulation helper for automated testing without credentials."""
        if not hasattr(self, "_mock_step"):
            self._mock_step = 0
            self._mock_phrases = [
                ("partial", "So for this problem,"),
                ("partial", "So for this problem, I'm thinking about"),
                ("partial", "So for this problem, I'm thinking about using a hash map"),
                ("final", "So for this problem, I'm thinking about using a hash map to store each complement."),
                ("partial", "As we iterate through the array,"),
                ("partial", "As we iterate through the array, we check if target minus num exists"),
                ("final", "As we iterate through the array, we check if target minus current number is already in the map."),
                ("final", "This gives us O(N) time complexity and O(N) space complexity instead of O(N^2)."),
            ]

        self._mock_step += 1
        if self._mock_step % 4 == 0:
            idx = (self._mock_step // 4 - 1) % len(self._mock_phrases)
            kind, text = self._mock_phrases[idx]
            self.loop.call_soon_threadsafe(
                self.queue.put_nowait,
                {
                    "type": kind,
                    "text": text,
                    "simulated": True,
                },
            )

    def close(self):
        """Cleanly terminates the AssemblyAI connection."""
        self.is_connected = False
        if self.transcriber:
            try:
                self.transcriber.disconnect()
            except Exception as e:
                logger.warning(f"Error during transcriber.disconnect(): {e}")
            finally:
                self.transcriber = None
