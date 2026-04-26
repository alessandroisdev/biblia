<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VerseController extends Controller
{
    public function index()
    {
        return view('admin.verses.index');
    }

    public function data(Request $request)
    {
        $query = \App\Models\Verse::with(['chapter.book.version']);

        // Global search
        if ($request->has('search') && !empty($request->search['value'])) {
            $searchValue = $request->search['value'];
            $query->where('text', 'LIKE', "%{$searchValue}%")
                  ->orWhereHas('chapter.book', function($q) use ($searchValue) {
                      $q->where('name', 'LIKE', "%{$searchValue}%");
                  });
        }

        // Pagination
        $start = $request->input('start', 0);
        $length = $request->input('length', 10);
        
        $totalRecords = \App\Models\Verse::count();
        $filteredRecords = $query->count();

        $verses = $query->skip($start)->take($length)->get();

        $data = $verses->map(function ($verse) {
            return [
                'id' => $verse->id,
                'version' => $verse->chapter->book->version->abbreviation ?? 'N/A',
                'book' => $verse->chapter->book->name ?? '',
                'chapter' => $verse->chapter->number ?? '',
                'verse' => $verse->number,
                'text' => $verse->text,
                'action' => '<button class="btn btn-sm btn-primary edit-verse" data-id="'.$verse->id.'" data-text="'.htmlspecialchars($verse->text).'">Editar</button>'
            ];
        });

        return response()->json([
            'draw' => intval($request->input('draw')),
            'recordsTotal' => $totalRecords,
            'recordsFiltered' => $filteredRecords,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        $verse = \App\Models\Verse::findOrFail($id);
        $verse->update(['text' => $request->text]);

        return response()->json(['success' => true, 'message' => 'Versículo atualizado com sucesso!']);
    }
}
