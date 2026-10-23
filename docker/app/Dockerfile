# Self-contained image: nginx + php-fpm (supervised) on the official PHP image.
# Expects `composer install --no-dev` and `npm run build` to have run before `docker build`
# (see .github/workflows/build.yml).
FROM php:8.4-fpm-alpine

WORKDIR /var/www

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN install-php-extensions pdo_mysql opcache \
    && rm /usr/local/bin/install-php-extensions \
    && apk add --no-cache nginx supervisor \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY docker/php.ini "$PHP_INI_DIR/conf.d/zz-app.ini"
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-app.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/app-entrypoint

COPY . /var/www

RUN chmod +x /usr/local/bin/app-entrypoint \
    && mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
    CMD wget -q -O /dev/null http://127.0.0.1/up || exit 1

ENTRYPOINT ["app-entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
