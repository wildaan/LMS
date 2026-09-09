<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;

    /**
     * Database table name.
     * TODO: Adjust schema and table name according to your design (e.g. system.contents or lms.contents)
     */
    protected $table = 'system.contents';

    /**
     * Primary key column.
     * TODO: Configure primary key and incrementing behavior
     */
    protected $primaryKey = 'content_id';

    /**
     * The attributes that are mass assignable.
     * TODO: Add fillable columns (e.g. title, slug, body, category_id, author_uuid, status)
     */
    protected $fillable = [
        // TODO: Define fillable attributes
    ];

    /**
     * Attribute casting.
     * TODO: Add attribute casts
     */
    protected function casts(): array
    {
        return [
            // TODO: Define casts
        ];
    }

    // TODO: Define relationships (e.g. user, category, tags)
}
