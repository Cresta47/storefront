<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    /**
     * Define the columns that should be saved as explicit database fields
     * rather than falling back into the catch-all JSON 'data' column.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'owner_name',
            'email',
            'phone',
            'trial_ends_at',
            'subscription_ends_at',
            'subscription_status',
        ];
    }
}
