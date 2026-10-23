<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasteRequest;
use App\Models\Paste;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class PastesController
{
    public function post(PasteRequest $request): RedirectResponse
    {
        $paste = Paste::createFromCode($request->validated('code'));

        return redirect()->route('show', $paste->hash)->with('created', true);
    }

    public function show(Paste $paste): View
    {
        return view('show', compact('paste'));
    }

    public function raw(Paste $paste): Response
    {
        return response($paste->code, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
            'X-Robots-Tag' => 'noindex',
        ]);
    }

    public function edit(Paste $paste): View
    {
        return view('edit', compact('paste'));
    }

    public function fork(PasteRequest $request, Paste $paste): RedirectResponse
    {
        $fork = Paste::createFromCode($request->validated('code'), $paste);

        return redirect()->route('show', $fork->hash)->with('created', true);
    }
}
