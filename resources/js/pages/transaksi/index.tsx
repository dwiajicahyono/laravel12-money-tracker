import AppLayout from '@/layouts/app-layout';
import transaksi from '@/routes/transaksi';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { dashboard } from '@/routes';
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

interface Transaksi {
    id: number;
    nama_transaksi: string;
    nominal: string;
    tanggal: string;
    jenis: 'pemasukan' | 'pengeluaran';
    created_at: string;
    user_id: number;
    user: {
        id: number;
        name: string;
    };
}

interface PaginatedTransaksi {
    data: Transaksi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    transaksis: PaginatedTransaksi;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Transaksi',
        href: transaksi.index().url,
    },
];

export default function Index({ transaksis }: Props) {
    const { props } = usePage();
    const currentUserId = (props.auth as any)?.user?.id;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTransaksi, setSelectedTransaksi] =
        useState<Transaksi | null>(null);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const createForm = useForm({
        nama_transaksi: '',
        nominal: '',
        tanggal: getTodayDate(),
        jenis: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    });

    const editForm = useForm({
        nama_transaksi: '',
        nominal: '',
        tanggal: '',
        jenis: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    });

    const handleOpenCreate = () => {
        createForm.setData({
            nama_transaksi: '',
            nominal: '',
            tanggal: getTodayDate(),
            jenis: 'pengeluaran',
        });
        setIsCreateOpen(true);
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

    const handleEdit = (item: Transaksi) => {
        setSelectedTransaksi(item);
        editForm.setData({
            nama_transaksi: item.nama_transaksi,
            nominal: item.nominal,
            tanggal: item.tanggal,
            jenis: item.jenis,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedTransaksi) return;

        editForm.put(transaksi.update(selectedTransaksi.id).url, {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
                setSelectedTransaksi(null);
                toast.success('Transaksi berhasil diupdate!');
            },
            onError: () => {
                toast.error('Gagal mengupdate transaksi');
            },
        });
    };

    const handleDeleteConfirm = (item: Transaksi) => {
        setSelectedTransaksi(item);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedTransaksi) return;

        editForm.delete(transaksi.destroy(selectedTransaksi.id).url, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedTransaksi(null);
                toast.success('Transaksi berhasil dihapus!');
            },
            onError: () => {
                toast.error('Gagal menghapus transaksi');
            },
        });
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    const formatNumber = (value: string) => {
        if (!value) return '';
        // Konversi ke number dulu untuk handle desimal, lalu bulatkan
        const numValue = parseFloat(value.toString());
        if (isNaN(numValue)) return '';
        // Bulatkan ke integer
        const intValue = Math.floor(numValue);
        // Format dengan pemisah ribuan
        return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleNominalChange = (
        value: string,
        form: typeof createForm | typeof editForm,
    ) => {
        // Simpan nilai asli tanpa pemisah
        const rawValue = value.replace(/\./g, '');
        form.setData('nominal', rawValue);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Daftar Transaksi</h1>
                    <Button onClick={handleOpenCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Transaksi
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:border-sidebar-border dark:bg-neutral-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nama Transaksi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nominal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Jenis
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {transaksis.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-neutral-500"
                                        >
                                            Belum ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    transaksis.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {(transaksis.current_page - 1) *
                                                    transaksis.per_page +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {item.nama_transaksi}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {formatCurrency(item.nominal)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {new Date(
                                                    item.tanggal,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        item.jenis ===
                                                        'pemasukan'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {item.jenis}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                        disabled={item.user_id !== currentUserId}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteConfirm(
                                                                item,
                                                            )
                                                        }
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        disabled={item.user_id !== currentUserId}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {transaksis.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-neutral-500">
                                    Menampilkan{' '}
                                    {(transaksis.current_page - 1) *
                                        transaksis.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        transaksis.current_page *
                                            transaksis.per_page,
                                        transaksis.total,
                                    )}{' '}
                                    dari {transaksis.total} transaksi
                                </div>
                                <div className="flex space-x-2">
                                    {Array.from(
                                        { length: transaksis.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <a
                                            key={page}
                                            href={
                                                transaksi.index({
                                                    query: { page },
                                                }).url
                                            }
                                        >
                                            <Button
                                                variant={
                                                    page ===
                                                    transaksis.current_page
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

            {/* Create Dialog */}
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
                                        handleNominalChange(
                                            e.target.value,
                                            createForm,
                                        )
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

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Transaksi</DialogTitle>
                        <DialogDescription>
                            Ubah data transaksi di bawah
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nama">
                                    Nama Transaksi
                                </Label>
                                <Input
                                    id="edit-nama"
                                    value={editForm.data.nama_transaksi}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'nama_transaksi',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {editForm.errors.nama_transaksi && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.nama_transaksi}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nominal">Nominal</Label>
                                <Input
                                    id="edit-nominal"
                                    type="text"
                                    value={formatNumber(editForm.data.nominal)}
                                    onChange={(e) =>
                                        handleNominalChange(e.target.value, editForm)
                                    }
                                    placeholder="0"
                                    required
                                />
                                {editForm.errors.nominal && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.nominal}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-tanggal">Tanggal</Label>
                                <Input
                                    id="edit-tanggal"
                                    type="date"
                                    value={editForm.data.tanggal}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'tanggal',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {editForm.errors.tanggal && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.tanggal}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-jenis">Jenis</Label>
                                <Select
                                    value={editForm.data.jenis}
                                    onValueChange={(value) =>
                                        editForm.setData(
                                            'jenis',
                                            value as 'pemasukan' | 'pengeluaran',
                                        )
                                    }
                                >
                                    <SelectTrigger id="edit-jenis">
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
                                {editForm.errors.jenis && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.jenis}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Transaksi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus transaksi "
                            {selectedTransaksi?.nama_transaksi}"? Tindakan ini
                            tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={editForm.processing}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}