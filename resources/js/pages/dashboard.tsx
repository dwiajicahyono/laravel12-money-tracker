import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, TrendingDown, TrendingUp, Wallet, DollarSign, ArrowLeftRight, Plus, History, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import transaksi from '@/routes/transaksi';

interface Category {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
}

interface Transaksi {
    id: number;
    nama_transaksi: string;
    nominal: string;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran';
    user: {
        name: string;
    };
    category?: Category | null;
}

interface PaginatedTransaksi {
    data: Transaksi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Statistics {
    pengeluaran_bulan_ini: number;
    pengeluaran_bulan_kemarin: number;
    pengeluaran_total: number;
    pemasukan_bulan_ini: number;
    pemasukan_bulan_kemarin: number;
    pemasukan_total: number;
    selisih_bulan_ini: number;
    selisih_total: number;
}

interface ActivePeriod {
    id: number;
    period_name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface Props {
    statistics: Statistics;
    transaksi_terbaru: PaginatedTransaksi;
    active_period: ActivePeriod;
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ statistics, transaksi_terbaru, active_period, categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const createForm = useForm({
        nama_transaksi: '',
        nominal: '',
        tanggal: getTodayDate(),
        jenis: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
        category_id: '',
    });

    const addCategoryForm = useForm({
        name: '',
    });

    const resetForm = useForm({
        start_date: getTodayDate(),
    });

    const handleOpenCreate = () => {
        createForm.setData({
            nama_transaksi: '',
            nominal: '',
            tanggal: getTodayDate(),
            jenis: 'pengeluaran',
            category_id: '',
        });
        setIsCreateOpen(true);
    };

    const handleAddCategory = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: addCategoryForm.data.name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create category');
            }

            const newCategory: Category = await response.json();
            setLocalCategories([...localCategories, newCategory]);
            createForm.setData('category_id', newCategory.id.toString());
            setIsAddCategoryOpen(false);
            addCategoryForm.reset();
            toast.success('Kategori berhasil ditambahkan!');
        } catch (error) {
            toast.error('Gagal menambahkan kategori');
        }
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post(transaksi.store().url, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                toast.success('Transaksi berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan transaksi');
            },
        });
    };

    const handleResetOpen = () => {
        resetForm.setData('start_date', getTodayDate());
        setIsResetOpen(true);
    };

    const handleReset = () => {
        resetForm.post('/period/reset', {
            onSuccess: () => {
                setIsResetOpen(false);
                toast.success('Periode berhasil direset!');
            },
            onError: () => {
                toast.error('Gagal mereset periode');
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDaysSince = (dateString: string) => {
        const startDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatCurrency = (amount: number) => {
        const value = amount || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value: string) => {
        if (!value) return '';
        const numValue = parseFloat(value.toString());
        if (isNaN(numValue)) return '';
        const intValue = Math.floor(numValue);
        return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleNominalChange = (value: string) => {
        const rawValue = value.replace(/\./g, '');
        createForm.setData('nominal', rawValue);
    };

    const cards = [
        {
            title: 'Pengeluaran Bulan Ini',
            value: statistics.pengeluaran_bulan_ini,
            icon: TrendingDown,
            color: 'bg-destructive',
        },
        {
            title: 'Pengeluaran Bulan Kemarin',
            value: statistics.pengeluaran_bulan_kemarin,
            icon: Calendar,
            color: 'bg-destructive dark:bg-orange-700',
        },
        {
            title: 'Total Pengeluaran',
            value: statistics.pengeluaran_total,
            icon: Wallet,
            color: 'bg-destructive dark:bg-rose-700',
        },
        {
            title: 'Pemasukan Bulan Ini',
            value: statistics.pemasukan_bulan_ini,
            icon: TrendingUp,
            color: 'bg-[#358600]',
        },
        {
            title: 'Pemasukan Bulan Kemarin',
            value: statistics.pemasukan_bulan_kemarin,
            icon: DollarSign,
            color: 'bg-[#358600] dark:bg-emerald-700',
        },
        {
            title: 'Total Pemasukan',
            value: statistics.pemasukan_total,
            icon: Wallet,
            color: 'bg-[#358600] dark:bg-teal-700',
        },
    ];

    const pieDataBulanIni = [
        {
            name: 'Pemasukan',
            value: parseFloat(statistics.pemasukan_bulan_ini?.toString() || '0'),
            color: '#358600' // primary blue
        },
        {
            name: 'Pengeluaran',
            value: parseFloat(statistics.pengeluaran_bulan_ini?.toString() || '0'),
            color: '#DB3069' // destructive red
        },
    ];

    const pieDataTotal = [
        {
            name: 'Pemasukan',
            value: parseFloat(statistics.pemasukan_total?.toString() || '0'),
            color: '#358600' // emerald green
        },
        {
            name: 'Pengeluaran',
            value: parseFloat(statistics.pengeluaran_total?.toString() || '0'),
            color: '#DB3069' // rose red
        },
    ];

    const hasDataBulanIni = parseFloat(statistics.pemasukan_bulan_ini?.toString() || '0') > 0 || parseFloat(statistics.pengeluaran_bulan_ini?.toString() || '0') > 0;
    const hasDataTotal = parseFloat(statistics.pemasukan_total?.toString() || '0') > 0 || parseFloat(statistics.pengeluaran_total?.toString() || '0') > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Period Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        {active_period && (
                            <div className="mt-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Periode Aktif: {active_period.period_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(active_period.start_date)} - {formatDate(active_period.end_date)}
                                </p>
                                <p className="text-xs font-semibold text-primary mt-0.5">
                                    Dimulai sejak: {formatDate(active_period.start_date)}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.location.href = '/period'}>
                            <History className="mr-2 h-4 w-4" />
                            Riwayat Periode
                        </Button>
                        <Button variant="destructive" onClick={handleResetOpen}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Periode
                        </Button>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Transaksi
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-900"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                                {card.title}
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                                {formatCurrency(card.value)}
                                            </p>
                                        </div>
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}
                                        >
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pie Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Perbandingan Bulan Ini
                        </h3>
                        {hasDataBulanIni ? (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieDataBulanIni}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) =>
                                                `${name}: ${(percent * 100).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieDataBulanIni.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) =>
                                                formatCurrency(value)
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Selisih:
                                        </span>
                                        <span
                                            className={`font-semibold ${statistics.selisih_bulan_ini >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        >
                                            {formatCurrency(
                                                statistics.selisih_bulan_ini,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-neutral-500">
                                Belum ada transaksi bulan ini
                            </div>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Perbandingan Total
                        </h3>
                        {hasDataTotal ? (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieDataTotal}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) =>
                                                `${name}: ${(percent * 100).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieDataTotal.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) =>
                                                formatCurrency(value)
                                            }
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Selisih:
                                        </span>
                                        <span
                                            className={`font-semibold ${statistics.selisih_total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        >
                                            {formatCurrency(statistics.selisih_total)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-neutral-500">
                                Belum ada transaksi
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="border-b border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Pengeluaran Terbaru
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:border-sidebar-border dark:bg-neutral-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nama Transaksi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nominal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nama Anggota
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {transaksi_terbaru.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-neutral-500"
                                        >
                                            Belum ada pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    transaksi_terbaru.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {item.nama_transaksi}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {item.category ? (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {item.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                <span className="font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(
                                                        parseFloat(item.nominal),
                                                    )}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {new Date(
                                                    item.tanggal,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {item.user.name}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transaksi_terbaru.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-neutral-500">
                                    Menampilkan{' '}
                                    {(transaksi_terbaru.current_page - 1) *
                                        transaksi_terbaru.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        transaksi_terbaru.current_page *
                                            transaksi_terbaru.per_page,
                                        transaksi_terbaru.total,
                                    )}{' '}
                                    dari {transaksi_terbaru.total} transaksi
                                </div>
                                <div className="flex space-x-2">
                                    {Array.from(
                                        { length: transaksi_terbaru.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <a
                                            key={page}
                                            href={
                                                dashboard({
                                                    query: { page },
                                                }).url
                                            }
                                        >
                                            <Button
                                                variant={
                                                    page ===
                                                    transaksi_terbaru.current_page
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                            >
                                                {page}
                                            </Button>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Transaction Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Transaksi</DialogTitle>
                        <DialogDescription>
                            Isi form di bawah untuk menambahkan transaksi baru
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-nama">
                                    Nama Transaksi
                                </Label>
                                <Input
                                    id="create-nama"
                                    value={createForm.data.nama_transaksi}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'nama_transaksi',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {createForm.errors.nama_transaksi && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.nama_transaksi}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-nominal">Nominal</Label>
                                <Input
                                    id="create-nominal"
                                    type="text"
                                    value={formatNumber(createForm.data.nominal)}
                                    onChange={(e) =>
                                        handleNominalChange(e.target.value)
                                    }
                                    placeholder="0"
                                    required
                                />
                                {createForm.errors.nominal && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.nominal}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-tanggal">Tanggal</Label>
                                <Input
                                    id="create-tanggal"
                                    type="date"
                                    value={createForm.data.tanggal}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'tanggal',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {createForm.errors.tanggal && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.tanggal}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-jenis">Jenis</Label>
                                <Select
                                    value={createForm.data.jenis}
                                    onValueChange={(value) =>
                                        createForm.setData(
                                            'jenis',
                                            value as 'pemasukan' | 'pengeluaran',
                                        )
                                    }
                                >
                                    <SelectTrigger id="create-jenis">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pemasukan">
                                            Pemasukan
                                        </SelectItem>
                                        <SelectItem value="pengeluaran">
                                            Pengeluaran
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {createForm.errors.jenis && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.jenis}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="create-category">Kategori (Opsional)</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsAddCategoryOpen(true)}
                                        className="h-auto py-1 px-2 text-xs"
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Tambah Baru
                                    </Button>
                                </div>
                                <Select
                                    value={createForm.data.category_id || undefined}
                                    onValueChange={(value) =>
                                        createForm.setData('category_id', value)
                                    }
                                >
                                    <SelectTrigger id="create-category">
                                        <SelectValue placeholder="Pilih kategori (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {localCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.category_id && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.category_id}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Period Confirmation Dialog */}
            <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Periode?</DialogTitle>
                        <DialogDescription>
                            {active_period && (
                                <div className="mb-4 p-3 bg-muted/50 rounded-md border">
                                    <p className="text-sm font-semibold text-foreground mb-1">
                                        Periode saat ini dimulai:
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {formatDate(active_period.start_date)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ({getDaysSince(active_period.start_date)} hari yang lalu)
                                    </p>
                                </div>
                            )}

                            Tindakan ini akan:
                            <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                                <li>Mengarsipkan semua transaksi periode saat ini</li>
                                <li>Membuat periode baru dimulai dari tanggal yang Anda pilih</li>
                                <li>Dashboard akan menampilkan data periode baru (dimulai dari 0)</li>
                                <li>Data lama tetap tersimpan dan dapat diakses di Riwayat Periode</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reset-start-date">
                                Pilih Tanggal Mulai Periode Baru
                            </Label>
                            <Input
                                id="reset-start-date"
                                type="date"
                                value={resetForm.data.start_date}
                                onChange={(e) => resetForm.setData('start_date', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Anda bisa mundur beberapa hari jika lupa mencatat transaksi
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsResetOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            disabled={resetForm.processing}
                        >
                            {resetForm.processing ? 'Mereset...' : 'Ya, Reset Periode'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>
                            Buat kategori baru untuk mengorganisir transaksi Anda
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCategory}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category-name">Nama Kategori</Label>
                                <Input
                                    id="category-name"
                                    value={addCategoryForm.data.name}
                                    onChange={(e) =>
                                        addCategoryForm.setData('name', e.target.value)
                                    }
                                    placeholder="Misal: Makanan, Transport, Belanja"
                                    required
                                />
                                {addCategoryForm.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {addCategoryForm.errors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddCategoryOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={addCategoryForm.processing}
                            >
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}