# Use an official Python runtime as the parent image
FROM python:3.8

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container
COPY . .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run python script when the container launches
CMD ["python", "sixmonthbuys_webscraper.py"]




# Use an official Python runtime as the parent image
FROM python:3.8

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies
RUN pip install --no-cache-dir requests beautifulsoup4 psycopg2-binary

# Copy the current directory contents into the container
COPY . .

# Run python script when the container launches
CMD ["python", "sixmonthbuys_webscraper.py"]
