<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('verses', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->integer('number');
            $table->text('text');
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['chapter_id', 'number']);
        });

        DB::statement('ALTER TABLE verses ADD FULLTEXT INDEX verses_text_fulltext (text)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verses');
    }
};
