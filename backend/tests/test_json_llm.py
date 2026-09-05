import pytest

from app.services.json_llm import parse_json_array


def test_parse_json_array_plain():
    result = parse_json_array('[{"a": 1}]')
    assert result == [{"a": 1}]


def test_parse_json_array_with_code_fence():
    text = '```json\n[{"a": 1}, {"b": 2}]\n```'
    result = parse_json_array(text)
    assert result == [{"a": 1}, {"b": 2}]


def test_parse_json_array_rejects_object():
    with pytest.raises(ValueError):
        parse_json_array('{"a": 1}')
