<p align="center">
    <img src="public/images/livck-mark.svg" width="64" alt="LIVCK" />
</p>

# LIVCK Paste

A small, self-hosted pastebin built with Laravel 13 and the Monaco editor. Originally forked from [laravelio/paste.laravel.io](https://github.com/laravelio/paste.laravel.io) (MIT).

## Requirements

The following tools are required in order to start the installation.

- PHP 8.3+
- [Composer](https://getcomposer.org/download/)
- [Node.js 22+ / NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Installation

1. Clone this repository locally with `git clone <this repository> paste`
2. Copy the `.env.example` file to `.env`
3. Install the PHP dependencies with `composer install`
4. Generate a new app key with `php artisan key:generate`
5. Run the migrations with `php artisan migrate`
6. Install and compile the front-end dependencies with `npm install && npm run build` (use `npm run dev` while developing)
7. Serve the website locally by running `php artisan serve`

You can now visit the app in your browser by visiting [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Commands

Command | Description
--- | ---
**`php artisan test`** | Run the tests
`php artisan migrate:fresh` | Reset the database
`npm run dev` | Watch for changes in CSS and JS files

## Upgrading an existing installation

The `pastes` table and its three migrations are unchanged, so an existing database (MySQL/MariaDB) keeps working as is:
`php artisan migrate` reports "Nothing to migrate" and no data is touched. Existing `.env` files keep working
(`CACHE_DRIVER` is still read as a fallback for `CACHE_STORE`); `APP_KEY`, `APP_URL` and the `DB_*` values stay the same.

The editor is [Monaco](https://microsoft.github.io/monaco-editor/), bundled by Vite together with the fonts
(Plus Jakarta Sans and Geist Mono, as per the LIVCK brand), so the app makes no requests to third-party hosts.

## Contributing

Please see [the contributing guide](CONTRIBUTING.md) for details.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing or engaging in discussions.

## Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## License

The MIT License. Please see [the license file](LICENSE.md) for more information.
