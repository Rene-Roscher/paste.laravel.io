<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LimitCodeLengthTest extends TestCase
{
    #[Test]
    public function it_disallows_long_code_posts(): void
    {
        $code = file_get_contents(__DIR__.'/../artifacts/long_text.txt');

        $this->post('/', compact('code'))
            ->assertSessionHasErrors('code')
            ->assertRedirect('/');
    }

    #[Test]
    public function it_disallows_code_that_would_overflow_the_text_column(): void
    {
        $code = str_repeat('€', 30000); // 30k characters, 90k bytes

        $this->post('/', compact('code'))->assertSessionHasErrors('code');
    }

    #[Test]
    public function it_requires_code(): void
    {
        $this->post('/', ['code' => '   '])->assertSessionHasErrors('code');
    }
}
