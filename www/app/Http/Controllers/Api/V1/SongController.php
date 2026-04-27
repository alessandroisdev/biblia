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

        // 2. Tenta buscar na API lyrics.ovh
        try {
            $urlOvh = "https://api.lyrics.ovh/v1/" . rawurlencode($artist) . "/" . rawurlencode($title);
            $responseOvh = Http::timeout(5)->get($urlOvh);

            if ($responseOvh->successful() && $responseOvh->json('lyrics')) {
                $lyrics = $responseOvh->json('lyrics');
                return $this->saveAndReturnSong($artist, $title, $lyrics, 'api.lyrics.ovh');
            }
        } catch (\Exception $e) {}

        // 3. Fallback: Scraper direto do Letras.mus.br (Excelente para músicas gospel brasileiras)
        try {
            $slugArtist = \Illuminate\Support\Str::slug($artist);
            $slugTitle = \Illuminate\Support\Str::slug($title);
            $urlLetras = "https://www.letras.mus.br/{$slugArtist}/{$slugTitle}/";
            
            $responseLetras = Http::timeout(10)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'])
                ->get($urlLetras);

            if ($responseLetras->successful()) {
                $html = $responseLetras->body();
                if (preg_match('/class="lyric-original">(.*?)<\/div>/s', $html, $matches)) {
                    $lyricHtml = $matches[1];
                    // Converte <p> e <br> para quebras de linha reais
                    $lyricHtml = preg_replace('/<p(.*?)>/', '', $lyricHtml);
                    $lyricHtml = str_replace('</p>', "\n\n", $lyricHtml);
                    $lyricHtml = str_replace(['<br/>', '<br>', '<br />'], "\n", $lyricHtml);
                    
                    $lyrics = trim(strip_tags($lyricHtml));
                    
                    if (!empty($lyrics)) {
                        return $this->saveAndReturnSong($artist, $title, $lyrics, 'scraper_letras');
                    }
                }
            }
        } catch (\Exception $e) {}

        return response()->json(['message' => 'Letra não encontrada na API ou no Scraper.'], 404);
    }

    private function saveAndReturnSong($artist, $title, $lyrics, $source)
    {
        $newSong = Song::create([
            'artist' => $artist,
            'title' => $title,
            'lyrics' => $lyrics
        ]);

        return response()->json([
            'source' => $source,
            'data' => $newSong
        ]);
    }
}
