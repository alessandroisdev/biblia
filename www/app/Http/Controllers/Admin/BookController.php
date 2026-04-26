<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        // For books, we can eager load versions to display nicely. Client side DataTables is fine for ~850 records.
        $books = \App\Models\Book::with('version')->get();
        return view('admin.books.index', compact('books'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'abbreviation' => 'required|string|max:10'
        ]);

        $book = \App\Models\Book::findOrFail($id);
        $book->update([
            'name' => $request->name,
            'abbreviation' => $request->abbreviation
        ]);

        return response()->json(['success' => true, 'message' => 'Livro atualizado com sucesso!']);
    }
}
