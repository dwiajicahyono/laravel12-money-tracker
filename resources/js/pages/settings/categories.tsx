import SettingsLayout from '@/layouts/settings/layout';
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
import { Plus, Trash2 } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    color: string | null;
    icon: string | null;
}

interface Props {
    categories: Category[];
}

export default function Categories({ categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const createForm = useForm({
        name: '',
    });

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

    const handleDeleteConfirm = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        const deleteForm = useForm({});
        deleteForm.delete(`/settings/categories/${selectedCategory.id}`, {
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
        <SettingsLayout>
            <Head title="Kategori" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Kategori</h3>
                    <p className="text-sm text-muted-foreground">
                        Kelola kategori untuk mengorganisir transaksi Anda
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="space-y-2">
                    {categories.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                Belum ada kategori. Klik tombol di atas untuk menambahkan.
                            </p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {category.name}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteConfirm(category)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))
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
        </SettingsLayout>
    );
}
