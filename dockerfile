# Use a compatible Python base image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Expose the port that the Flask app will run on
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]
