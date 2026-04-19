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
        Schema::table('user_settings', function (Blueprint $table) {
            $table->boolean('manual_night_mode')->default(false)->after('auto_night_mode');

            // Change auto_night_mode default to false (manual mode by default)
            $table->boolean('auto_night_mode')->default(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->dropColumn('manual_night_mode');

            // Revert auto_night_mode default back to true
            $table->boolean('auto_night_mode')->default(true)->change();
        });
    }
};
