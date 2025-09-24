# Use official PHP + Apache image
FROM php:8.2-apache

# Copy all website files into container
COPY . /var/www/html/

# Enable mysqli extension for database
RUN docker-php-ext-install mysqli

# Expose port 80
EXPOSE 80
