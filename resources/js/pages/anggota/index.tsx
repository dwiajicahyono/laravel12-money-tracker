import AppLayout from '@/layouts/app-layout';
import anggota from '@/routes/anggota';
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
import { useState, FormEvent, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    users: PaginatedUsers;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Anggota',
        href: anggota.index().url,
    },
];

export default function Index({ users }: Props) {
    const { auth } = usePage().props as any;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleOpenCreate = () => {
        createForm.setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        });
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post(anggota.store().url, {
            onSuccess: () => {
                setIsCreateOpen(false);
                toast.success('Anggota berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan anggota');
            },
        });
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        editForm.put(anggota.update({ anggotum: selectedUser.id }).url, {
            onSuccess: () => {
                setIsEditOpen(false);
                toast.success('Anggota berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui anggota');
            },
        });
    };

    const handleDeleteConfirm = (user: User) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedUser) return;

        if (selectedUser.id === auth.user.id) {
            toast.error('Tidak dapat menghapus akun sendiri');
            setIsDeleteOpen(false);
            return;
        }

        editForm.delete(anggota.destroy({ anggotum: selectedUser.id }).url, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success('Anggota berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus anggota');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anggota" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Anggota</h1>
                    <Button onClick={handleOpenCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Anggota
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-sidebar-border/70 bg-neutral-50 dark:border-sidebar-border dark:bg-neutral-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Tanggal Bergabung
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-8 text-center text-neutral-500"
                                        >
                                            Belum ada anggota
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                {user.name}
                                                {user.id === auth.user.id && (
                                                    <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Anda
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {user.email}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteConfirm(
                                                                user,
                                                            )
                                                        }
                                                        disabled={
                                                            user.id ===
                                                            auth.user.id
                                                        }
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
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

                    {users.last_page > 1 && (
                        <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-neutral-500">
                                    Menampilkan{' '}
                                    {(users.current_page - 1) * users.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        users.current_page * users.per_page,
                                        users.total,
                                    )}{' '}
                                    dari {users.total} anggota
                                </div>
                                <div className="flex space-x-2">
                                    {Array.from(
                                        { length: users.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <a
                                            key={page}
                                            href={
                                                anggota.index({
                                                    query: { page },
                                                }).url
                                            }
                                        >
                                            <Button
                                                variant={
                                                    page === users.current_page
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
                        <DialogTitle>Tambah Anggota</DialogTitle>
                        <DialogDescription>
                            Tambahkan anggota baru ke sistem
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.email && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                />
                                {createForm.errors.password && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                />
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
                                {createForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Anggota</DialogTitle>
                        <DialogDescription>
                            Perbarui data anggota. Kosongkan password jika tidak
                            ingin mengubahnya.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nama</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                />
                                {editForm.errors.email && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-password">
                                    Password Baru (opsional)
                                </Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                />
                                {editForm.errors.password && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-password_confirmation">
                                    Konfirmasi Password Baru
                                </Label>
                                <Input
                                    id="edit-password_confirmation"
                                    type="password"
                                    value={editForm.data.password_confirmation}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                />
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
                                {editForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Anggota</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus anggota{' '}
                            <span className="font-semibold">
                                {selectedUser?.name}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={editForm.processing}
                        >
                            {editForm.processing ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
