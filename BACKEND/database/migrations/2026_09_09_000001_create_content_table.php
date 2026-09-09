<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // TODO: Define your Content table schema or raw SQL statement here
        // Example:
        // Schema::create('contents', function (Blueprint $table) {
        //     $table->id('content_id');
        //     $table->string('title');
        //     $table->text('description')->nullable();
        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // TODO: Reverse the migrations (drop contents table)
        // Schema::dropIfExists('contents');
    }
};
