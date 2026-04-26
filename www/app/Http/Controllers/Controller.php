<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    description: "API Core para os clientes Reader, Display e Study-Tool.",
    title: "Bíblia Online e Gestão Teológica API",
    contact: new OA\Contact(
        name: "Alessandro Dev",
        email: "contato@alessandroisdev.com"
    )
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    description: "Servidor da API"
)]
abstract class Controller
{
    //
}
