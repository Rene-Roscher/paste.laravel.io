<p align="center">
    <img src="https://github.com/laravelio/art/blob/main/laravelio-logo-lg.svg" width="400" />
</p>

<p align="center">
    <a href="https://github.com/laravelio/paste.laravel.io/actions?query=workflow%3ATests">
        <img src="https://github.com/laravelio/paste.laravel.io/workflows/Tests/badge.svg" alt="Tests" />
    </a>
    <a href="https://github.com/laravelio/paste.laravel.io/actions/workflows/coding-standards.yml">
        <img src="https://github.com/laravelio/paste.laravel.io/actions/workflows/coding-standards.yml/badge.svg" alt="Coding Standards" />
    </a>
</p>

# Laravel.io Pastebin

This is the repository for [the Laravel.io pastebin](https://paste.laravel.io). The code is entirely open source and licensed under [the MIT license](license.md). We welcome your contributions but we encourage you to read the [the contributing guide](CONTRIBUTING.md) before creating an issue or sending in a pull request. Read the installation guide below to get started with setting up the app on your machine.

## Requirements

The following tools are required in order to start the installation.

- PHP 8.3+
- [Composer](https://getcomposer.org/download/)
- [Node.js 22+ / NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Installation

1. Clone this repository locally with `git clone git@github.com:laravelio/paste.laravel.io.git paste.laravel.io`
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
(Inter and JetBrains Mono), so the app makes no requests to third-party hosts.

## Maintainers

The Laravel.io pastebin is currently maintained by [Dries Vints](https://github.com/driesvints) and [Joe Dixon](https://github.com/joedixon). If you have any questions please don't hesitate to create an issue on this repo.

## Contributing

Please see [the contributing guide](contributing.md) for details.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing or engaging in discussions.

## Security Vulnerabilities

Please review [our security policy](.github/SECURITY.md) on how to report security vulnerabilities.

## License

The MIT License. Please see [the license file](license.md) for more information.
