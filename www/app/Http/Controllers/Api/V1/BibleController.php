<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Version;
use App\Models\Book;
use App\Models\Chapter;
use App\Models\Verse;
use OpenApi\Attributes as OA;


class BibleController extends Controller
{
    #[OA\Get(
        path: "/api/v1/versions",
        summary: "Listar Versões da Bíblia",
        description: "Retorna todas as versões de bíblias disponíveis.",
        tags: ["Bible"]
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    public function getVersions()
    {
        return response()->json(Version::all());
    }

    #[OA\Get(
        path: "/api/v1/books",
        summary: "Listar Livros",
        description: "Retorna os livros da Bíblia.",
        tags: ["Bible"]
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    public function getBooks()
    {
        return response()->json(Book::all());
    }

    #[OA\Get(
        path: "/api/v1/chapters/{book_id}",
        summary: "Listar Capítulos",
        description: "Retorna os capítulos de um determinado livro.",
        tags: ["Bible"]
    )]
    #[OA\Parameter(
        name: "book_id",
        in: "path",
        required: true,
        description: "ID do Livro",
        schema: new OA\Schema(type: "integer")
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    public function getChapters($book_id)
    {
        return response()->json(Chapter::where('book_id', $book_id)->get());
    }

    #[OA\Get(
        path: "/api/v1/verses/{chapter_id}",
        summary: "Listar Versículos",
        description: "Retorna os versículos de um determinado capítulo.",
        tags: ["Bible"]
    )]
    #[OA\Parameter(
        name: "chapter_id",
        in: "path",
        required: true,
        description: "ID do Capítulo",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    public function getVerses($chapter_id)
    {
        return response()->json(Verse::where('chapter_id', $chapter_id)->get());
    }

    #[OA\Get(
        path: "/api/v1/verse/{id}",
        summary: "Obter Versículo Específico",
        description: "Retorna um versículo específico pelo seu ID (ex: ARA-GN-1-1).",
        tags: ["Bible"]
    )]
    #[OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "ID composto do Versículo",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    #[OA\Response(
        response: 404,
        description: "Versículo não encontrado"
    )]
    public function getVerse($id)
    {
        $verse = Verse::find($id);
        if (!$verse) {
            return response()->json(['error' => 'Verse not found'], 404);
        }
        return response()->json($verse);
    }

    #[OA\Get(
        path: "/api/v1/search",
        summary: "Pesquisar Versículos (FTS)",
        description: "Busca versículos usando Full-Text Search.",
        tags: ["Bible"]
    )]
    #[OA\Parameter(
        name: "q",
        in: "query",
        required: true,
        description: "Termo de busca",
        schema: new OA\Schema(type: "string")
    )]
    #[OA\Response(
        response: 200,
        description: "Operação bem sucedida"
    )]
    public function searchVerses(Request $request)
    {
        $query = $request->query('q');
        if (!$query) {
            return response()->json(['error' => 'Query parameter "q" is required'], 400);
        }

        $verses = Verse::whereRaw('MATCH(text) AGAINST(? IN BOOLEAN MODE)', [$query])->get();
        return response()->json($verses);
    }
}

