<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SSEController extends Controller
{
    /**
     * Endpoint para notificações em tempo real (SSE).
     */
    public function stream(Request $request)
    {
        $response = new StreamedResponse(function () use ($request) {
            // Em produção, isso se conectaria ao Redis Pub/Sub
            $counter = 0;
            while (true) {
                $counter++;
                
                // Exemplo de payload
                $data = [
                    'time' => now()->toIso8601String(),
                    'message' => 'Heartbeat',
                    'count' => $counter
                ];

                echo "data: " . json_encode($data) . "\n\n";
                ob_flush();
                flush();

                // Dorme por 5 segundos
                sleep(5);

                // Opcional: verificar conexão do cliente
                if (connection_aborted()) {
                    break;
                }
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('X-Accel-Buffering', 'no');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');

        return $response;
    }
}
