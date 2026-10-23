<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Maps the existing `pastes` table 1:1 (id, parent_id, code, hash, created_at, updated_at).
 * Do not change column names or hash format, production data relies on them.
 */
class Paste extends Model
{
    use HasFactory;

    protected $table = 'pastes';

    public static function createFromCode(string $code, ?self $parent = null): self
    {
        $paste = new static;
        $paste->parent_id = $parent?->id;
        $paste->code = $code;
        $paste->hash = (string) Str::uuid();
        $paste->save();

        return $paste;
    }

    public function getRouteKeyName(): string
    {
        return 'hash';
    }
}
