<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [

        Commands\TransactionsComprobateMtn::class, //schedule
        Commands\TransactionsConfirmOnline::class, //schedule
        Commands\CaptureIngenicoTransactions::class, //schedule
        Commands\TransactionsUpdate::class, //schedule
        Commands\UsersActivateState::class, //bajo demanda
        Commands\UsersBlackList::class, //schedule
        Commands\UsersEmailNoDashboard::class, //schedule
        Commands\UsersMaintenance::class, //schedule
        Commands\UsersReportApp::class, //schedule
        Commands\UsersReportRegister::class, //schedule
        Commands\UsersReportTransactionsErrorQuality::class, //schedule
        Commands\UsersExpiringDocuments::class, //schedule
        Commands\ValidateEmail::class,
        Commands\NotificationsAdmPush::class, //schedule
        Commands\NotificationsSendTestEmail::class, //bajo demanda
        Commands\UsersAttachments::class, //
        Commands\WebIdSync::class, // schedule
        Commands\BeneficiariesScraper::class,
        Commands\CopyExcelCountryCurrencyLocal::class,
        Commands\UsersPendingEmail::class, //schedule
        Commands\DispatchJob::class,
        Commands\BeneficiariesAnywhereRepcodes::class,
        Commands\UpdateIncorrectDefaultLanguages::class
    ];
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        if (config('toggle_features.transactions_update')) {
            $schedule->command('transactions:update')->everyTenMinutes();
        }

        if (config('toggle_features.transactions_ingenico_captures')) {
            $schedule->command('transactions:ingenico_captures')->hourly();
        }

        if (config('toggle_features.users_maintenance')) {
            $schedule->command('users:maintenance')->hourly();
        }

        if (config('toggle_features.transactions_confirmonline')) {
            $schedule->command('transactions:confirmonline')->cron('*/15 * * * *'); //every 15 minutes
        }

        if (config('toggle_features.notifications_adm_push')) {
            $schedule->command('notifications:adm_push')->hourly();
        }

        if (config('toggle_features.users_attachments')) {
            $schedule->command('users:attachments')->hourly();
        }

        if (config('toggle_features.report_transactions_error_quality')) {
            $schedule->command('users:report_transactions_error_quality')->cron('0 8-17 * * *');
        }

        if (config('toggle_features.transactions_comprobate_mtn')) {
            $schedule->command('transactions:comprobate_mtn')->cron('0 */4 * * *');
        }

        if (config('toggle_features.users_blacklist')) {
            $schedule->command('users:blacklist')->daily()->at('00:30');
        }

        if (config('toggle_features.users_report_register')) {
            $schedule->command('users:report_register')->daily()->at('02:00');
        }

        if (config('toggle_features.users_report_transactions_error')) {
            $schedule->command('users:report_transactions_error --ALL')->daily()->at('02:30');
        }

        if (config('toggle_features.users_report_transactions_error')) {
            $schedule->command('users:report_transactions_error')->daily()->at('02:45');
        }

        if (config('toggle_features.users_email_no_dashboard')) {
            $schedule->command('users:email_no_dashboard')->daily()->at('03:00');
        }

        if (config('toggle_features.users_expiring_documents')) {
            $schedule->command('users:expiring_documents')->daily()->at('3:30');
        }

        if (config('toggle_features.users_report_app')) {
            $schedule->command('users:report_app')->weekly()->sundays()->at('00:45');
        }


        if (config('toggle_features.users_pending_email')) {
            $schedule->command('users:pending_email')->daily()->at('9:00');
        }
        if (config('toggle_features.riskified_historic_transactions_sync') && \App::environment() == 'prod') {
            // Only run this command on production environment
            $schedule->command('job:dispatch RiskifiedHistoricTransactionsSync')->daily()->at('02:00');
        }
    }
}