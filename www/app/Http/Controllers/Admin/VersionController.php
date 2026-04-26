<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VersionController extends Controller
{
    public function index()
    {
        $versions = \App\Models\Version::all();
        return view('admin.versions.index', compact('versions'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:10'
        ]);

        $version = \App\Models\Version::findOrFail($id);
        $version->update([
            'name' => $request->name,
            'abbreviation' => $request->abbreviation
        ]);

        return response()->json(['success' => true, 'message' => 'Versão atualizada com sucesso!']);
    }
}
