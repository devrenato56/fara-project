FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# Railway/Render inyectan un $PORT dinamico; en local cae a 8000.
# Forma shell (no exec) para que $PORT se expanda.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
