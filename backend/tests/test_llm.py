from unittest.mock import AsyncMock, patch

import pytest
from google.genai import errors as genai_errors

from app.services import llm


def _client_error(code: int) -> genai_errors.ClientError:
    return genai_errors.ClientError(code, {"error": {"message": "x", "status": "X"}})


@pytest.mark.asyncio
async def test_generate_retries_on_rate_limit(monkeypatch):
    monkeypatch.setattr(llm, "RATE_LIMIT_BACKOFF_SEC", 0)
    calls = {"n": 0}

    async def side_effect(*_args, **_kwargs):
        calls["n"] += 1
        if calls["n"] < 3:
            raise _client_error(429)

        class Response:
            text = "ok"

        return Response()

    with patch.object(llm, "genai") as mocked_genai:
        mocked_genai.Client.return_value.aio.models.generate_content = AsyncMock(side_effect=side_effect)
        llm._client = mocked_genai.Client.return_value
        result = await llm.generate("prompt")

    assert result == "ok"
    assert calls["n"] == 3


@pytest.mark.asyncio
async def test_generate_fails_fast_on_non_rate_limit_client_error():
    async def side_effect(*_args, **_kwargs):
        raise _client_error(400)

    with patch.object(llm, "genai") as mocked_genai:
        mocked_genai.Client.return_value.aio.models.generate_content = AsyncMock(side_effect=side_effect)
        llm._client = mocked_genai.Client.return_value
        with pytest.raises(llm.LLMUnavailableError):
            await llm.generate("prompt")

    # No debe haber reintentado: un unico intento.
    assert mocked_genai.Client.return_value.aio.models.generate_content.await_count == 1


@pytest.mark.asyncio
async def test_generate_json_object_translates_malformed_json():
    async def fake_generate(*_args, **_kwargs):
        return "esto no es json"

    with patch.object(llm, "generate", side_effect=fake_generate):
        with pytest.raises(llm.LLMUnavailableError):
            await llm.generate_json_object("prompt")


@pytest.mark.asyncio
async def test_generate_json_object_translates_missing_keys():
    async def fake_generate(*_args, **_kwargs):
        return "{}"

    with patch.object(llm, "generate", side_effect=fake_generate):
        result = await llm.generate_json_object("prompt")

    # {} es JSON valido y un objeto: generate_json_object no exige claves,
    # eso es responsabilidad de cada agente (ver evaluator.py).
    assert result == {}
