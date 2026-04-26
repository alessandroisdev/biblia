<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Book extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = ['version_id', 'name', 'abbreviation', 'testament'];

    public function version()
    {
        return $this->belongsTo(Version::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }
}
