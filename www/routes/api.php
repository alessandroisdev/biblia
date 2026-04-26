<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\BibleController;
use App\Http\Controllers\Api\V1\SongController;
use App\Http\Controllers\SSEController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::get('/versions', [BibleController::class, 'getVersions']);
    Route::get('/books', [BibleController::class, 'getBooks']);
    Route::get('/chapters/{book_id}', [BibleController::class, 'getChapters']);
    Route::get('/verses/{chapter_id}', [BibleController::class, 'getVerses']);
    Route::get('/verse/{id}', [BibleController::class, 'getVerse']);
    Route::get('/search', [BibleController::class, 'searchVerses']);
    
    // Rota de Músicas (Acervo de Louvor)
    Route::get('/songs', [SongController::class, 'index']);
    Route::post('/songs/fetch', [SongController::class, 'fetch']);
    
    // SSE Realtime Endpoints
    Route::get('/stream', [SSEController::class, 'stream']);

    Route::get('/migrate', function() {
        \Illuminate\Support\Facades\Artisan::call('migrate');
        return \Illuminate\Support\Facades\Artisan::output();
    });
});
