<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\BibleController;
use App\Http\Controllers\SSEController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::get('/versions', [BibleController::class, 'getVersions']);
    Route::get('/books', [BibleController::class, 'getBooks']);
    Route::get('/chapters/{book_id}', [BibleController::class, 'getChapters']);
    Route::get('/verses/{chapter_id}', [BibleController::class, 'getVerses']);
    
    // SSE Realtime Endpoints
    Route::get('/stream', [SSEController::class, 'stream']);
});
