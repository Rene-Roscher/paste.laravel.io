#!/bin/sh
set -e

cd /var/www

# Runtime directories must be writable for php-fpm (www-data), also on mounted volumes.
mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Cache config, routes, views and events with the environment this container actually runs with.
php artisan optimize

exec "$@"
