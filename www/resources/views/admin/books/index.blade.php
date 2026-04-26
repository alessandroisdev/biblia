@extends('layouts.app')

@section('title', 'Gerenciar Livros - Bíblia Admin')

@section('content')
<div class="row mb-4">
    <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="fw-bold"><i class="bi bi-book text-primary"></i> Gerenciar Livros</h2>
    </div>
</div>

<div class="card shadow-sm border-0">
    <div class="card-body">
        <div class="table-responsive">
            <table id="booksTable" class="table table-striped table-hover align-middle w-100">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Versão (Referência)</th>
                        <th>Sigla</th>
                        <th width="40%">Nome do Livro</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($books as $book)
                    <tr>
                        <td>{{ $book->id }}</td>
                        <td><span class="badge bg-info text-dark">{{ $book->version->abbreviation ?? 'N/A' }}</span></td>
                        <td><span class="badge bg-secondary">{{ $book->abbreviation }}</span></td>
                        <td>{{ $book->name }}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-book" 
                                data-id="{{ $book->id }}" 
                                data-abbreviation="{{ $book->abbreviation }}"
                                data-name="{{ $book->name }}">
                                Editar
                            </button>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Edição -->
<div class="modal fade" id="editBookModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editBookForm">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Editar Livro</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="book_id" name="id">
                    
                    <div class="mb-3">
                        <label for="book_abbreviation" class="form-label">Sigla</label>
                        <input type="text" class="form-control" id="book_abbreviation" name="abbreviation" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="book_name" class="form-label">Nome do Livro</label>
                        <input type="text" class="form-control" id="book_name" name="name" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btnSaveBook">
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

        $('#booksTable').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            pageLength: 25,
        });

        // Abrir Modal
        $('.edit-book').on('click', function() {
            $('#book_id').val($(this).data('id'));
            $('#book_abbreviation').val($(this).data('abbreviation'));
            $('#book_name').val($(this).data('name'));
            
            const modal = new bootstrap.Modal(document.getElementById('editBookModal'));
            modal.show();
        });

        // Salvar
        $('#editBookForm').on('submit', function(e) {
            e.preventDefault();
            const id = $('#book_id').val();
            const abbreviation = $('#book_abbreviation').val();
            const name = $('#book_name').val();
            const btn = $('#btnSaveBook');
            const spinner = btn.find('.spinner-border');
            
            btn.prop('disabled', true);
            spinner.removeClass('d-none');

            $.ajax({
                url: `/admin/books/${id}`,
                method: 'POST',
                data: {
                    abbreviation: abbreviation,
                    name: name
                },
                success: function(response) {
                    if (response.success) {
                        $('#editBookModal').modal('hide');
                        location.reload(); 
                    }
                },
                error: function(xhr) {
                    alert('Erro ao atualizar livro.');
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
