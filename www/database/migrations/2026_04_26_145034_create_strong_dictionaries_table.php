<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('strong_dictionaries', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. H1234 or G1234
            $table->string('original_word');
            $table->string('transliteration');
            $table->string('pronunciation');
            $table->text('definition');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('strong_dictionaries');
    }
};
