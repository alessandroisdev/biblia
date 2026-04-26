<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Verse extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'chapter_id', 'number', 'text'];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
