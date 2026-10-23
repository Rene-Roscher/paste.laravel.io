<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class PasteRequest extends FormRequest
{
    /** Size of a MySQL TEXT column. */
    private const MAX_BYTES = 65535;

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:50000',
                // Multibyte characters could otherwise overflow the TEXT column.
                function (string $attribute, mixed $value, Closure $fail) {
                    if (strlen($value) > self::MAX_BYTES) {
                        $fail('The code is too large.');
                    }
                },
            ],
        ];
    }
}
