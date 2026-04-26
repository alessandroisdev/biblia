<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BibleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Limpar banco atual (já estamos rodando fresh, mas garantimos que as tabelas do laravel estão vazias)
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Verse::truncate();
        \App\Models\Chapter::truncate();
        \App\Models\Book::truncate();
        \App\Models\Version::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // 2. Localizar o arquivo SQL que foi montado no container PHP em /var/www/biblia_13V/biblia_13V.sql
        $sqlPath = '/var/www/biblia_13V/biblia_13V.sql';

        if (!file_exists($sqlPath)) {
            $this->command->error("Arquivo SQL não encontrado no container: {$sqlPath}");
            return;
        }

        $this->command->info("1. Importando as tabelas originais via binário MySQL (isto pode levar 10-20 segundos)...");
        // Usar o cliente mysql nativo do container para evitar problemas de memória do PHP e timeout do PDO com arquivos muito grandes.
        $command = "mysql --skip-ssl -h db -u user -ppassword biblia < " . escapeshellarg($sqlPath);
        
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $this->command->error("Erro ao importar o arquivo SQL. Código de saída: {$returnVar}");
            return;
        }

        $this->command->info("2. Migrando Versões...");
        \Illuminate\Support\Facades\DB::statement("
            INSERT INTO versions (id, name, abbreviation, language, created_at, updated_at)
            SELECT 
                vrs_id, 
                vrs_nome, 
                CONCAT('V', vrs_id), 
                'pt-BR', 
                NOW(), 
                NOW()
            FROM versoes
        ");

        $this->command->info("3. Migrando Livros...");
        \Illuminate\Support\Facades\DB::statement("
            INSERT INTO books (version_id, name, abbreviation, testament, created_at, updated_at)
            SELECT 
                v.vrs_id,
                l.liv_nome,
                IF(l.liv_id = 18, 'job', l.liv_abreviado),
                IF(l.liv_tes_id = 1, 'OT', 'NT'),
                NOW(),
                NOW()
            FROM livros l
            CROSS JOIN versoes v
        ");

        $this->command->info("4. Migrando Capítulos...");
        \Illuminate\Support\Facades\DB::statement("
            INSERT INTO chapters (book_id, number, created_at, updated_at)
            SELECT DISTINCT b.id, v.ver_capitulo, NOW(), NOW()
            FROM versiculos v
            JOIN livros l ON v.ver_liv_id = l.liv_id
            JOIN books b ON b.version_id = v.ver_vrs_id AND b.abbreviation = IF(l.liv_id = 18, 'job', l.liv_abreviado)
        ");

        $this->command->info("5. Migrando Versículos (A etapa mais demorada)...");
        \Illuminate\Support\Facades\DB::statement("
            INSERT IGNORE INTO verses (id, chapter_id, number, text, created_at, updated_at)
            SELECT 
                CONCAT(ver.abbreviation, '-', b.abbreviation, '-', v.ver_capitulo, '-', v.ver_versiculo),
                c.id,
                v.ver_versiculo,
                v.ver_texto,
                NOW(),
                NOW()
            FROM versiculos v
            JOIN livros l ON v.ver_liv_id = l.liv_id
            JOIN books b ON b.version_id = v.ver_vrs_id AND b.abbreviation = IF(l.liv_id = 18, 'job', l.liv_abreviado)
            JOIN chapters c ON c.book_id = b.id AND c.number = v.ver_capitulo
            JOIN versions ver ON ver.id = b.version_id
        ");

        $this->command->info("6. Limpeza das tabelas antigas...");
        \Illuminate\Support\Facades\DB::statement("DROP TABLE IF EXISTS testamentos, livros, versoes, versiculos");

        $this->command->info("Seed concluído com sucesso!");
    }
}
