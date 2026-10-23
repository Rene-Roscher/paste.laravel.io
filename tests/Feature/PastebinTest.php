<?php

namespace Tests\Feature;

use App\Models\Paste;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PastebinTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_shows_the_pastebin(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Save')
            ->assertSee('Reset');
    }

    #[Test]
    public function users_can_create_pastes(): void
    {
        $response = $this->post('/', ['code' => 'My paste']);

        $paste = Paste::firstOrFail();
        $response->assertRedirect(route('show', $paste->hash));
        $this->assertSame('My paste', $paste->code);
        $this->assertNull($paste->parent_id);
    }

    #[Test]
    public function users_can_see_pastes(): void
    {
        $paste = Paste::factory()->create(['code' => '<?php echo "<b>hi</b>";']);

        $this->get("/{$paste->hash}")
            ->assertOk()
            ->assertSee(e($paste->code), false)
            ->assertDontSee($paste->code, false);
    }

    #[Test]
    public function unknown_pastes_return_404(): void
    {
        $this->get('/does-not-exist')->assertNotFound()->assertSee('Paste not found');
    }

    #[Test]
    public function users_can_see_raw_pastes_as_plain_text(): void
    {
        $paste = Paste::factory()->create(['code' => '<script>alert(1)</script>']);

        $this->get("/{$paste->hash}/raw")
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertContent($paste->code);
    }

    #[Test]
    public function users_can_see_the_fork_page(): void
    {
        $paste = Paste::factory()->create();

        $this->get("/fork/{$paste->hash}")
            ->assertOk()
            ->assertSee(e($paste->code), false);
    }

    #[Test]
    public function users_can_fork_pastes(): void
    {
        $paste = Paste::factory()->create();

        $this->post("/fork/{$paste->hash}", ['code' => 'foo code'])->assertRedirect();

        $this->assertDatabaseHas('pastes', ['code' => 'foo code', 'parent_id' => $paste->id]);
    }

    #[Test]
    public function responses_carry_security_headers(): void
    {
        $this->get('/')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Content-Security-Policy');
    }

    #[Test]
    public function the_pastes_table_keeps_its_legacy_schema(): void
    {
        $this->assertSame(
            ['id', 'parent_id', 'code', 'hash', 'created_at', 'updated_at'],
            Schema::getColumnListing('pastes'),
        );
    }

    #[Test]
    public function posting_is_rate_limited(): void
    {
        foreach (range(1, 30) as $i) {
            $this->post('/', ['code' => "paste {$i}"])->assertRedirect();
        }

        $this->post('/', ['code' => 'one too many'])->assertStatus(429);
    }
}
