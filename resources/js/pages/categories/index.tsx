import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
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
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
    transaksis_count: number;
}

interface Props {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Kategori',
        href: '/categories',
    },
];

export default function Index({ categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const deleteForm = useForm({});

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: createForm.data.name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create category');
            }

            setIsCreateOpen(false);
            createForm.reset();
            toast.success('Kategori berhasil ditambahkan!');

            // Reload the page to show new category
            window.location.reload();
        } catch (error) {
            toast.error('Gagal menambahkan kategori');
        }
    };

    const handleEditOpen = (category: Category) => {
        setSelectedCategory(category);
        editForm.setData('name', category.name);
        setIsEditOpen(true);
    };

    const handleEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        editForm.put(`/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedCategory(null);
                editForm.reset();
                toast.success('Kategori berhasil diupdate!');
            },
            onError: () => {
                toast.error('Gagal mengupdate kategori');
            },
        });
    };

    const handleDeleteConfirm = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        deleteForm.delete(`/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedCategory(null);
                toast.success('Kategori berhasil dihapus!');
            },
            onError: () => {
                toast.error('Gagal menghapus kategori');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Kategori</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola kategori untuk mengorganisir transaksi Anda
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-900">
                    {categories.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                Belum ada kategori. Klik tombol di atas untuk menambahkan.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {category.name}
                                        </span>
                                        {category.transaksis_count > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                {category.transaksis_count} transaksi
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditOpen(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {category.transaksis_count === 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteConfirm(category)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Category Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Baru</DialogTitle>
                        <DialogDescription>
                            Buat kategori baru untuk mengorganisir transaksi Anda
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category-name">Nama Kategori</Label>
                                <Input
                                    id="category-name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData('name', e.target.value)
                                    }
                                    placeholder="Misal: Makanan, Transport, Belanja"
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {createForm.errors.name}
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
                            <Button type="submit" disabled={createForm.processing}>
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Kategori</DialogTitle>
                        <DialogDescription>
                            Ubah nama kategori
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-name">Nama Kategori</Label>
                                <Input
                                    id="edit-category-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    placeholder="Misal: Makanan, Transport, Belanja"
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {editForm.errors.name}
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
                            <Button type="submit" disabled={editForm.processing}>
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
                        <DialogTitle>Hapus Kategori</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kategori "
                            {selectedCategory?.name}"? Transaksi yang menggunakan kategori ini tidak akan terhapus.
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
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
