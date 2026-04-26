<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SongController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/songs",
     *     summary="Listar músicas do acervo",
     *     tags={"Louvor"},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Buscar por título ou artista",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de músicas"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Song::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('artist', 'LIKE', "%{$search}%");
        }

        return response()->json($query->orderBy('artist')->orderBy('title')->get());
    }

    /**
     * @OA\Post(
     *     path="/api/v1/songs/fetch",
     *     summary="Buscar música (Cache Inteligente)",
     *     description="Busca uma música no banco local. Se não existir, baixa da API pública, salva e retorna.",
     *     tags={"Louvor"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"artist","title"},
     *             @OA\Property(property="artist", type="string", example="Aline Barros"),
     *             @OA\Property(property="title", type="string", example="Ressuscita-me")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Letra da música"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Música não encontrada em lugar nenhum"
     *     )
     * )
     */
    public function fetch(Request $request)
    {
        $request->validate([
            'artist' => 'required|string',
            'title' => 'required|string',
        ]);

        $artist = trim($request->input('artist'));
        $title = trim($request->input('title'));

        // 1. Busca no Banco de Dados (Ignora case via DB ou similar, mas let's use firstOrCreate if exact, or fuzzy search)
        $song = Song::where('artist', 'LIKE', $artist)
                    ->where('title', 'LIKE', $title)
                    ->first();

        if ($song) {
            return response()->json([
                'source' => 'database',
                'data' => $song
            ]);
        }

        // 2. Se não encontrou, busca na API lyrics.ovh
        try {
            $url = "https://api.lyrics.ovh/v1/" . urlencode($artist) . "/" . urlencode($title);
            $response = Http::timeout(10)->get($url);

            if ($response->successful() && $response->json('lyrics')) {
                $lyrics = $response->json('lyrics');

                // Salva no Banco
                $newSong = Song::create([
                    'artist' => $artist,
                    'title' => $title,
                    'lyrics' => $lyrics
                ]);

                return response()->json([
                    'source' => 'api',
                    'data' => $newSong
                ]);
            }
        } catch (\Exception $e) {
            // Fails silently to return 404
        }

        return response()->json(['message' => 'Letra não encontrada.'], 404);
    }
}
