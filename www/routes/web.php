<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function() {
        return redirect()->route('admin.verses.index');
    })->name('dashboard');

    Route::get('/verses', [App\Http\Controllers\Admin\VerseController::class, 'index'])->name('verses.index');
    Route::get('/verses/data', [App\Http\Controllers\Admin\VerseController::class, 'data'])->name('verses.data');
    Route::post('/verses/{id}', [App\Http\Controllers\Admin\VerseController::class, 'update'])->name('verses.update');

    Route::get('/versions', [App\Http\Controllers\Admin\VersionController::class, 'index'])->name('versions.index');
    Route::post('/versions/{id}', [App\Http\Controllers\Admin\VersionController::class, 'update'])->name('versions.update');

    Route::get('/books', [App\Http\Controllers\Admin\BookController::class, 'index'])->name('books.index');
    Route::post('/books/{id}', [App\Http\Controllers\Admin\BookController::class, 'update'])->name('books.update');
});
