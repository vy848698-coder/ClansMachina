# PHP + Apache image for the ClansMachina public site and JSON APIs.
# Railway builds this and serves it on $PORT.
FROM php:8.2-apache

# PDO MySQL (used by db.php) + mysqli (used by get_inquiries.php / update_status.php).
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Apache: ensure exactly ONE MPM is active (prefork, required for mod_php).
# Disabling the others prevents "More than one MPM loaded" startup crashes.
RUN a2dismod mpm_event mpm_worker 2>/dev/null || true
RUN a2enmod mpm_prefork rewrite

# Copy the site into Apache's web root.
COPY . /var/www/html/

# Make the blog cover-image upload folder writable by Apache.
# blog-save.php writes uploaded images directly into image/blog/.
RUN mkdir -p /var/www/html/image/blog \
    && chown -R www-data:www-data /var/www/html/image/blog

# Railway sets $PORT at runtime. Configure Apache to read it from the environment
# so it listens on whatever port Railway assigns (falls back to 80 locally).
RUN sed -i 's/Listen 80/Listen ${APACHE_PORT}/' /etc/apache2/ports.conf \
    && sed -i 's/:80>/:${APACHE_PORT}>/' /etc/apache2/sites-available/000-default.conf

EXPOSE 80

# Resolve $PORT at start, expose it to Apache as APACHE_PORT, then run Apache.
CMD ["sh", "-c", "export APACHE_PORT=${PORT:-80} && apache2-foreground"]
