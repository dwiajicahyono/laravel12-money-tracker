import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface Period {
    id: number;
    period_name: string;
    start_date: string;
    end_date: string;
    total_pemasukan: number;
    total_pengeluaran: number;
    total_selisih: number;
    total_transactions: number;
    is_active: boolean;
}

interface PaginatedPeriods {
    data: Period[];
    current_page: number;
    last_page: number;
}

interface Props {
    periods: PaginatedPeriods;
    active_period: Period | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Riwayat Periode', href: '/period' },
];

export default function PeriodIndex({ periods, active_period }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Periode" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Riwayat Periode</h1>
                        <p className="text-muted-foreground">
                            Lihat ringkasan periode-periode sebelumnya
                        </p>
                    </div>
                </div>

                {/* Active Period Card */}
                {active_period && (
                    <Card className="border-primary">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Periode Aktif: {active_period.period_name}
                                </CardTitle>
                                <Badge>Aktif</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pemasukan</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(active_period.total_pemasukan)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pengeluaran</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(active_period.total_pengeluaran)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Selisih</p>
                                    <p className={`text-2xl font-bold ${
                                        active_period.total_selisih >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}>
                                        {formatCurrency(active_period.total_selisih)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Archived Periods List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Periode Sebelumnya</h2>

                    {periods.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                Belum ada periode yang diarsipkan
                            </CardContent>
                        </Card>
                    ) : (
                        periods.data.map((period) => (
                            <Card key={period.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{period.period_name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(period.start_date)} - {formatDate(period.end_date)}
                                            </p>
                                        </div>
                                        <Link href={`/period/${period.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Detail
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Pemasukan</p>
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(period.total_pemasukan)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Pengeluaran</p>
                                            <p className="font-semibold text-red-600">
                                                {formatCurrency(period.total_pengeluaran)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Selisih</p>
                                            <p className={`font-semibold ${
                                                period.total_selisih >= 0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {formatCurrency(period.total_selisih)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Transaksi</p>
                                            <p className="font-semibold">
                                                {period.total_transactions}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {periods.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: periods.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/period?page=${page}`}
                                className={`px-4 py-2 border rounded ${
                                    page === periods.current_page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
