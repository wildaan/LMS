<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserActivity extends Model
{
    use HasFactory;

    /**
     * Database table name.
     */
    protected $table = 'user_activity';

    /**
     * Primary key column.
     */
    protected $primaryKey = 'user_activity_id';

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
        'user_activity_id',
        'user_activity_user_uuid',
        'user_activity_action',
        'user_activity_description',
        'user_activity_ip_address',
        'user_activity_create_date',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_activity_id' => 'integer',
            'user_activity_create_date' => 'datetime',
        ];
    }

    /**
     * Helper method to log user activity.
     *
     * @param string|null $userUuid
     * @param string $action
     * @param string|null $description
     * @param Request|null $request
     * @return static
     */
    public static function logActivity(?string $userUuid, string $action, ?string $description = null, ?Request $request = null): self
    {
        $nextId = (int) DB::scalar("SELECT nextval('user_activity_id_seq')");
        $ip = $request ? $request->ip() : request()->ip();

        return static::create([
            'user_activity_id' => $nextId,
            'user_activity_user_uuid' => $userUuid,
            'user_activity_action' => $action,
            'user_activity_description' => $description,
            'user_activity_ip_address' => $ip,
            'user_activity_create_date' => now(),
        ]);
    }
}
