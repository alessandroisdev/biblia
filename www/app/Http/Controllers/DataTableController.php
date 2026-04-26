<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

abstract class DataTableController extends Controller
{
    /**
     * Retorna a query base para o DataTable.
     */
    abstract protected function getBaseQuery(): Builder;

    /**
     * Mapeia os índices das colunas enviadas pelo DataTable para os nomes das colunas no BD.
     */
    abstract protected function getColumnMap(): array;

    /**
     * Processa a requisição POST do DataTable e retorna o JSON.
     */
    public function dataTable(Request $request)
    {
        $query = $this->getBaseQuery();
        
        $draw = $request->input('draw', 1);
        $start = $request->input('start', 0);
        $length = $request->input('length', 10);
        $search = $request->input('search.value');
        $orderColumnIndex = $request->input('order.0.column');
        $orderDir = $request->input('order.0.dir', 'asc');

        $columns = $this->getColumnMap();

        // Total de registros antes do filtro
        $recordsTotal = $query->count();

        // Aplicação de filtro global (busca)
        if (!empty($search)) {
            $query->where(function (Builder $q) use ($columns, $search) {
                foreach ($columns as $column) {
                    // Evitar pesquisar em colunas virtuais ou de relacionamento complexo aqui (pode ser sobrescrito)
                    $q->orWhere($column, 'LIKE', "%{$search}%");
                }
            });
        }

        // Total de registros após o filtro
        $recordsFiltered = $query->count();

        // Ordenação
        if (isset($orderColumnIndex) && isset($columns[$orderColumnIndex])) {
            $query->orderBy($columns[$orderColumnIndex], $orderDir);
        }

        // Paginação
        if ($length > 0) {
            $query->offset($start)->limit($length);
        }

        $data = $query->get()->map(function ($item) {
            return $this->formatRow($item);
        });

        return response()->json([
            "draw" => intval($draw),
            "recordsTotal" => $recordsTotal,
            "recordsFiltered" => $recordsFiltered,
            "data" => $data
        ]);
    }

    /**
     * Formata os dados de uma linha específica (pode ser sobrescrito pelos filhos).
     */
    protected function formatRow($item): array
    {
        return $item->toArray();
    }
}
