<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create sequences for int8 IDs
        DB::statement('CREATE SEQUENCE IF NOT EXISTS "users_id_seq";');
        DB::statement('CREATE SEQUENCE IF NOT EXISTS "user_activity_id_seq";');

        // 2. Create table "users" with exact raw SQL
        DB::statement('
            CREATE TABLE IF NOT EXISTS "users" (
                "users_id" int8 NOT NULL,
                "users_uuid" varchar(38),
                "users_email" varchar(255),
                "users_user_name" varchar(255),
                "users_password" varchar(500),
                "users_create_date" timestamp(6),
                "users_create_by" varchar(38),
                "users_update_date" timestamp(6),
                "users_update_by" varchar(38),
                "users_status" int4,
                CONSTRAINT "users_pkey" PRIMARY KEY ("users_id")
            );
        ');

        // 3. Create table "user_activity" with exact raw SQL
        DB::statement('
            CREATE TABLE IF NOT EXISTS "user_activity" (
                "user_activity_id" int8 NOT NULL,
                "user_activity_user_uuid" varchar(38),
                "user_activity_action" varchar(100),
                "user_activity_description" text,
                "user_activity_ip_address" varchar(45),
                "user_activity_create_date" timestamp(6),
                CONSTRAINT "user_activity_pkey" PRIMARY KEY ("user_activity_id")
            );
        ');

        // Index on user_activity_user_uuid for efficient lookup
        DB::statement('CREATE INDEX IF NOT EXISTS "user_activity_user_uuid_index" ON "user_activity" ("user_activity_user_uuid");');

        // Laravel session & password reset support
        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('user_id', 38)->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        DB::statement('DROP TABLE IF EXISTS "user_activity";');
        DB::statement('DROP TABLE IF EXISTS "users";');
        DB::statement('DROP SEQUENCE IF EXISTS "user_activity_id_seq";');
        DB::statement('DROP SEQUENCE IF EXISTS "users_id_seq";');
    }
};
