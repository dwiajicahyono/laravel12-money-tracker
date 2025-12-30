<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function transaksis(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(Period::class);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function activePeriod(): ?Period
    {
        return $this->periods()->active()->first();
    }

    public function getOrCreateActivePeriod(): Period
    {
        $activePeriod = $this->activePeriod();

        if (!$activePeriod) {
            $settings = $this->settings ?? UserSetting::create([
                'user_id' => $this->id,
                'payday_date' => 1,
            ]);

            $activePeriod = $this->createNewPeriod($settings->payday_date);
        }

        return $activePeriod;
    }

    private function createNewPeriod(int $paydayDate): Period
    {
        $periodService = app(\App\Services\PeriodService::class);
        return $periodService->createNewPeriod($this, $paydayDate);
    }
}
