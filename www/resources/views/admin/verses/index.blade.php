@extends('layouts.app')

@section('title', 'Gerenciar Versículos - Bíblia Admin')

@section('content')
<div class="row mb-4">
    <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="fw-bold"><i class="bi bi-card-text text-primary"></i> Gerenciar Versículos</h2>
    </div>
</div>

<div class="card shadow-sm border-0">
    <div class="card-body">
        <div class="table-responsive">
            <table id="versesTable" class="table table-striped table-hover align-middle w-100">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Versão</th>
                        <th>Livro</th>
                        <th>Capítulo</th>
                        <th>Versículo</th>
                        <th width="40%">Texto</th>
                        <th>Ações</th>
                    </tr>
                </thead>
            </table>
        </div>
    </div>
</div>

<!-- Modal Edição de Versículo -->
<div class="modal fade" id="editVerseModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="editVerseForm">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Editar Versículo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="verse_id" name="id">
                    
                    <div class="mb-3">
                        <label for="verse_text" class="form-label">Texto do Versículo</label>
                        <textarea class="form-control fs-5" id="verse_text" name="text" rows="5" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btnSaveVerse">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    $(document).ready(function() {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        const table = $('#versesTable').DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('admin.verses.data') }}",
            columns: [
                { data: 'id', name: 'id' },
                { data: 'version', name: 'version', orderable: false, searchable: false },
                { data: 'book', name: 'book' },
                { data: 'chapter', name: 'chapter' },
                { data: 'verse', name: 'verse' },
                { data: 'text', name: 'text' },
                { data: 'action', name: 'action', orderable: false, searchable: false }
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            pageLength: 10,
        });

        // Abrir Modal de Edição
        $('#versesTable').on('click', '.edit-verse', function() {
            const id = $(this).data('id');
            const text = $(this).data('text');
            
            $('#verse_id').val(id);
            $('#verse_text').val(text);
            
            const modal = new bootstrap.Modal(document.getElementById('editVerseModal'));
            modal.show();
        });

        // Salvar Edição via AJAX
        $('#editVerseForm').on('submit', function(e) {
            e.preventDefault();
            const id = $('#verse_id').val();
            const text = $('#verse_text').val();
            const btn = $('#btnSaveVerse');
            const spinner = btn.find('.spinner-border');
            
            btn.prop('disabled', true);
            spinner.removeClass('d-none');

            $.ajax({
                url: `/admin/verses/${id}`,
                method: 'POST',
                data: {
                    text: text
                },
                success: function(response) {
                    if (response.success) {
                        $('#editVerseModal').modal('hide');
                        table.draw(false); // Atualiza a tabela sem perder a paginação
                        // Você pode adicionar uma notificação Toast aqui
                        alert(response.message);
                    }
                },
                error: function(xhr) {
                    alert('Erro ao atualizar versículo.');
                    console.error(xhr.responseText);
                },
                complete: function() {
                    btn.prop('disabled', false);
                    spinner.addClass('d-none');
                }
            });
        });
    });
</script>
@endpush
