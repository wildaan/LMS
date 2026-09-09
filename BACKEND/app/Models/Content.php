<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Content extends Model
{
    use HasFactory;

    /**
     * Database table name explicitly specifying public schema.
     */
    protected $table = 'public.content';

    /**
     * Primary key column.
     */
    protected $primaryKey = 'content_id';

    /**
     * Non-incrementing primary key because ID is generated from sequence.
     */
    public $incrementing = false;

    /**
     * Disable default Laravel timestamps.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'content_id',
        'content_uuid',
        'content_title',
        'content_description',
        'content_category',
        'content_status',
        'content_create_date',
        'content_create_by',
        'content_update_date',
        'content_update_by',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content_id' => 'integer',
            'content_status' => 'integer',
            'content_create_date' => 'datetime',
            'content_update_date' => 'datetime',
        ];
    }

    /**
     * Bootstrap model events.
     */
    protected static function booted(): void
    {
        static::creating(function (Content $content) {
            if (empty($content->content_id)) {
                $content->content_id = (int) DB::scalar("SELECT nextval('public.content_id_seq')");
            }
            if (empty($content->content_uuid)) {
                $content->content_uuid = (string) Str::uuid();
            }
            if (empty($content->content_create_date)) {
                $content->content_create_date = now();
            }
            if (!isset($content->content_status)) {
                $content->content_status = 1;
            }
            if (empty($content->content_create_by)) {
                $authUser = auth('api')->user();
                $content->content_create_by = $authUser?->users_uuid;
            }
        });

        static::updating(function (Content $content) {
            $content->content_update_date = now();
            $authUser = auth('api')->user();
            if ($authUser?->users_uuid) {
                $content->content_update_by = $authUser->users_uuid;
            }
        });
    }
}
