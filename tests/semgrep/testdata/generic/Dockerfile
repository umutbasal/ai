FROM python:3.9
USER root
RUN apt-get update
RUN apt-get install -y curl
COPY . /app
WORKDIR /app
CMD ["python", "app.py"]
