import httpx
import os
import json
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("agnes.client")

class AgnesClient:
    """
    Agnes 3.0 Flash Client
    Base URL: https://apihub.agnes-ai.com/v1
    Primary Model: agnes-3.0-flash (512K context)
    Image Model: agnes-image-2.5-flash
    """

    def __init__(self):
        self.base_url = settings.AGNES_API_BASE.rstrip("/")
        self.api_key = settings.AGNES_API_KEY
        self.primary_model = settings.AGNES_MODEL
        self.image_model = settings.AGNES_IMAGE_MODEL
        self.rate_limit_rpm = 10
        self._last_request_time = 0.0

    async def _respect_rate_limit(self):
        # 10 RPM means 6 seconds between requests to be safe
        now = time.time()
        time_since_last = now - self._last_request_time
        min_interval = 60.0 / self.rate_limit_rpm
        if time_since_last < min_interval:
            wait_time = min_interval - time_since_last
            logger.info(f"Rate limiting: waiting {wait_time:.2f}s before next request...")
            await asyncio.sleep(wait_time)
        self._last_request_time = time.time()

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: str = "auto",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        fallback_generator = None
    ) -> Dict[str, Any]:
        """
        Sends request to /v1/chat/completions using agnes-3.0-flash.
        Uses exponential backoff for rate limits.
        Falls back seamlessly to local generation if offline or API key unconfigured.
        """
        if not self.api_key:
            logger.info("No AGNES_API_KEY configured. Running with intelligent demo fallback.")
            if fallback_generator:
                res = await fallback_generator()
                res["is_demo_fallback"] = True
                return res
            return {
                "role": "assistant",
                "content": "Agnes 3.0 Flash demo response.",
                "is_demo_fallback": True
            }

        await self._respect_rate_limit()

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.primary_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = tool_choice

        retries = 3
        backoff = 2.0
        for attempt in range(retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        data["is_demo_fallback"] = False
                        return data
                    elif resp.status_code == 429:
                        logger.warning(f"Rate limited (429) by Agnes API. Retrying in {backoff}s...")
                        await asyncio.sleep(backoff)
                        backoff *= 2
                    else:
                        logger.error(f"Agnes API error {resp.status_code}: {resp.text}")
                        break
            except Exception as e:
                logger.error(f"Agnes API connection exception: {e}")
                await asyncio.sleep(backoff)
                backoff *= 1.5

        # Fallback if API fails
        logger.info("Executing demo fallback output per hackathon rules.")
        if fallback_generator:
            res = await fallback_generator()
            res["is_demo_fallback"] = True
            return res
        return {
            "role": "assistant",
            "content": "Agnes 3.0 Flash response via resilient demo fallback.",
            "is_demo_fallback": True
        }

    async def generate_image(self, prompt: str, size: str = "1024x1024") -> Dict[str, Any]:
        """
        Generates visual diagram via /v1/images/generations using agnes-image-2.5-flash
        """
        if not self.api_key:
            return {
                "url": f"https://placehold.co/800x450/1e293b/38bdf8?text={prompt[:30].replace(' ', '+')}",
                "prompt": prompt,
                "is_demo_fallback": True
            }

        await self._respect_rate_limit()
        url = f"{self.base_url}/images/generations"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.image_model,
            "prompt": prompt,
            "size": size,
            "n": 1
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    data["is_demo_fallback"] = False
                    return data
        except Exception as e:
            logger.error(f"Agnes image generation failed: {e}")

        return {
            "url": f"https://placehold.co/800x450/0f172a/38bdf8?text={prompt[:30].replace(' ', '+')}",
            "prompt": prompt,
            "is_demo_fallback": True
        }

agnes_client = AgnesClient()
