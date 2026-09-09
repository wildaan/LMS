<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Database table name.
     */
    protected $table = 'system.users';

    /**
     * Primary key column.
     */
    protected $primaryKey = 'users_id';

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
        'users_id',
        'users_uuid',
        'users_email',
        'users_user_name',
        'users_password',
        'users_create_date',
        'users_create_by',
        'users_update_date',
        'users_update_by',
        'users_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'users_password',
    ];

    /**
     * Attribute casting.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'users_id' => 'integer',
            'users_status' => 'integer',
            'users_create_date' => 'datetime',
            'users_update_date' => 'datetime',
        ];
    }

    /**
     * Bootstrap model events.
     */
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->users_id)) {
                $user->users_id = (int) DB::scalar("SELECT nextval('system.users_id_seq')");
            }
            if (empty($user->users_uuid)) {
                $user->users_uuid = (string) Str::uuid();
            }
            if (empty($user->users_create_date)) {
                $user->users_create_date = now();
            }
            if (!isset($user->users_status)) {
                $user->users_status = 1;
            }
        });

        static::updating(function (User $user) {
            $user->users_update_date = now();
        });
    }

    /**
     * JWT Subject Identifier (return users_uuid as specified).
     */
    public function getJWTIdentifier()
    {
        return $this->users_uuid;
    }

    /**
     * Custom claims for JWT token.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Override auth identifier name so Laravel and JWT provider query by users_uuid.
     */
    public function getAuthIdentifierName(): string
    {
        return 'users_uuid';
    }

    /**
     * Override auth identifier value.
     */
    public function getAuthIdentifier()
    {
        return $this->users_uuid;
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->users_password;
    }

    /**
     * Accessor mapping for 'email' -> 'users_email'
     */
    public function getEmailAttribute(): ?string
    {
        return $this->users_email;
    }

    /**
     * Mutator mapping for 'email' -> 'users_email'
     */
    public function setEmailAttribute($value): void
    {
        $this->attributes['users_email'] = $value;
    }

    /**
     * Accessor mapping for 'password' -> 'users_password'
     */
    public function getPasswordAttribute(): ?string
    {
        return $this->users_password;
    }

    /**
     * Mutator mapping for 'password' -> 'users_password'
     */
    public function setPasswordAttribute($value): void
    {
        $this->attributes['users_password'] = $value;
    }
}
