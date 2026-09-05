FROM python:3.12-slim

# No escribir .pyc y logs sin buffer (para que Render los muestre en vivo).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Correr como usuario sin privilegios.
RUN useradd --create-home --uid 1000 fara && chown -R fara:fara /app
USER fara

EXPOSE 8000

# Railway/Render inyectan un $PORT dinamico; en local cae a 8000.
# Forma shell (no exec) para que $PORT se expanda.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
