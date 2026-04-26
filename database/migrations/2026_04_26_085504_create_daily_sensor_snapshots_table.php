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
        Schema::create('daily_sensor_snapshots', function (Blueprint $table) {
            $table->id();
            $table->date('snapshot_date')->unique();          // e.g. 2026-04-25
            $table->dateTime('snapshot_taken_at');            // exact time of last reading
            $table->float('temperature_c')->nullable();
            $table->float('temperature_f')->nullable();
            $table->float('humidity')->nullable();
            $table->float('heat_index_c')->nullable();
            $table->float('heat_index_f')->nullable();
            $table->float('uv_index')->nullable();
            $table->float('uva')->nullable();
            $table->float('uvb')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_sensor_snapshots');
    }
};
