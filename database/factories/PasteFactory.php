<?php

namespace Database\Factories;

use App\Models\Paste;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Paste> */
class PasteFactory extends Factory
{
    protected $model = Paste::class;

    public function definition(): array
    {
        return [
            'hash' => (string) Str::uuid(),
            'code' => fake()->realText(),
        ];
    }
}
