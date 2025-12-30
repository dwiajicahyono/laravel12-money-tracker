import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

interface ArchivedTransaction {
    id: number;
    nama_transaksi: string;
    nominal: string;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran';
    user: { name: string };
}

interface PaginatedTransactions {
    data: ArchivedTransaction[];
    current_page: number;
    last_page: number;
}

interface Period {
    id: number;
    period_name: string;
    start_date: string;
    end_date: string;
    total_pemasukan: number;
    total_pengeluaran: number;
    total_selisih: number;
    total_transactions: number;
}

interface Props {
    period: Period;
    transactions: PaginatedTransactions;
}

export default function PeriodShow({ period, transactions }: Props) {
    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Riwayat Periode', href: '/period' },
        { title: period.period_name, href: `/period/${period.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Periode: ${period.period_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/period">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{period.period_name}</h1>
                        <p className="text-muted-foreground">
                            {formatDate(period.start_date)} - {formatDate(period.end_date)}
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Total Pemasukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(period.total_pemasukan)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Total Pengeluaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(period.total_pengeluaran)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Selisih
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${
                                period.total_selisih >= 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}>
                                {formatCurrency(period.total_selisih)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Total Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {period.total_transactions}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-neutral-50 dark:bg-neutral-800">
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Nama Transaksi</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Nominal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                Tidak ada transaksi
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                                <TableCell>
                                                    {formatDate(transaction.tanggal)}
                                                </TableCell>
                                                <TableCell>{transaction.nama_transaksi}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            transaction.jenis === 'pemasukan'
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {transaction.jenis === 'pemasukan' ? (
                                                            <TrendingUp className="h-3 w-3" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3" />
                                                        )}
                                                        {transaction.jenis}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{transaction.user.name}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(transaction.nominal)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/period/${period.id}?page=${page}`}
                                className={`px-4 py-2 border rounded ${
                                    page === transactions.current_page
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
