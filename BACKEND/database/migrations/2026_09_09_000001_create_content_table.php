<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE SEQUENCE IF NOT EXISTS "public"."content_id_seq" START WITH 1 INCREMENT BY 1;');

        DB::statement('
            CREATE TABLE IF NOT EXISTS "public"."content" (
                "content_id" int8 NOT NULL,
                "content_uuid" varchar(38),
                "content_title" varchar(255) NOT NULL,
                "content_description" text,
                "content_category" varchar(100),
                "content_status" int4 DEFAULT 1,
                "content_create_date" timestamp(6),
                "content_create_by" varchar(38),
                "content_update_date" timestamp(6),
                "content_update_by" varchar(38),
                CONSTRAINT "content_pkey" PRIMARY KEY ("content_id")
            );
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS "public"."content" CASCADE;');
        DB::statement('DROP SEQUENCE IF EXISTS "public"."content_id_seq";');
    }
};
