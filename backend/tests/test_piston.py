import pytest

from app.services.piston import PistonExecutionError, run_code


@pytest.mark.asyncio
async def test_run_code_happy_path():
    result = await run_code("python", "3.10.0", "print(1 + 1)")
    assert result["run"]["stdout"].strip() == "2"


@pytest.mark.asyncio
async def test_run_code_invalid_language_raises():
    with pytest.raises(PistonExecutionError):
        await run_code("not-a-real-language", "0.0.0", "print(1)")
