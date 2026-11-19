# Self-contained image: nginx + php-fpm (supervised) on the official PHP image.
# Expects `composer install --no-dev` and `npm run build` to have run before `docker build`
# (see .github/workflows/build.yml).
# Pinned to one exact image: the PHP security release of 19.11.2026 is in 8.4.28. A floating tag
# could keep serving a cached older PHP after a rebuild. Move it on purpose.
FROM php:8.4.28-fpm-alpine3.24@sha256:d4fac3a1247d1b6644f377b9769dc10a0faa8a6b42a63d961fce1b56289b7f0e

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
