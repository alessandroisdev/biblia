@extends('layouts.app')

@section('title', 'Gerenciar Versões - Bíblia Admin')

@section('content')
<div class="row mb-4">
    <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="fw-bold"><i class="bi bi-journal-text text-primary"></i> Gerenciar Versões</h2>
    </div>
</div>

<div class="card shadow-sm border-0">
    <div class="card-body">
        <div class="table-responsive">
            <table id="versionsTable" class="table table-striped table-hover align-middle w-100">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Sigla</th>
                        <th width="50%">Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($versions as $version)
                    <tr>
                        <td>{{ $version->id }}</td>
                        <td><span class="badge bg-secondary">{{ $version->abbreviation }}</span></td>
                        <td>{{ $version->name }}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-version" 
                                data-id="{{ $version->id }}" 
                                data-abbreviation="{{ $version->abbreviation }}"
                                data-name="{{ $version->name }}">
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
<div class="modal fade" id="editVersionModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editVersionForm">
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Editar Versão</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="version_id" name="id">
                    
                    <div class="mb-3">
                        <label for="version_abbreviation" class="form-label">Sigla</label>
                        <input type="text" class="form-control" id="version_abbreviation" name="abbreviation" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="version_name" class="form-label">Nome Completo</label>
                        <input type="text" class="form-control" id="version_name" name="name" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btnSaveVersion">
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

        $('#versionsTable').DataTable({
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            pageLength: 25,
        });

        // Abrir Modal
        $('.edit-version').on('click', function() {
            $('#version_id').val($(this).data('id'));
            $('#version_abbreviation').val($(this).data('abbreviation'));
            $('#version_name').val($(this).data('name'));
            
            const modal = new bootstrap.Modal(document.getElementById('editVersionModal'));
            modal.show();
        });

        // Salvar
        $('#editVersionForm').on('submit', function(e) {
            e.preventDefault();
            const id = $('#version_id').val();
            const abbreviation = $('#version_abbreviation').val();
            const name = $('#version_name').val();
            const btn = $('#btnSaveVersion');
            const spinner = btn.find('.spinner-border');
            
            btn.prop('disabled', true);
            spinner.removeClass('d-none');

            $.ajax({
                url: `/admin/versions/${id}`,
                method: 'POST',
                data: {
                    abbreviation: abbreviation,
                    name: name
                },
                success: function(response) {
                    if (response.success) {
                        $('#editVersionModal').modal('hide');
                        // Recarrega a página para refletir as alterações no Client-Side table
                        location.reload(); 
                    }
                },
                error: function(xhr) {
                    alert('Erro ao atualizar versão.');
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
