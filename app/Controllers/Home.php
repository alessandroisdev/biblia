<?php

namespace App\Controllers;

use App\Helpers\Arrays;
use App\Models\LivroModel;
use App\Models\TestamentoModel;
use App\Models\VersiculoModel;

class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }

    public function testamentos(): string
    {
        $testamentos = (new TestamentoModel())->findAll();
        return json_encode($testamentos);
    }

    public function livros(): string
    {
        $livros = (new LivroModel())->findAll();
        return json_encode($livros);
    }

    public function capitulos(int $livro_id): string
    {
        $capitulos = (new VersiculoModel())->where("book_id", $livro_id)->findAll();
        return json_encode(Arrays::simplificar($capitulos, 'chapter'));
    }

    public function versiculos(int $livro_id, int $capitulo_id): string
    {
        $versiculos = (new VersiculoModel())->where(["book_id" => $livro_id, "chapter" => $capitulo_id])->findAll();
        return json_encode($versiculos);
    }

    public function versiculo(int $livro_id, int $capitulo_id, int $versiculo_id): string
    {
        $versiculos = (new VersiculoModel())->where(["book_id" => $livro_id, "chapter" => $capitulo_id, "verse" => $versiculo_id])->first();
        return json_encode($versiculos);
    }
}
