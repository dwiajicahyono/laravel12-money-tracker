<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryManagementController extends Controller
{
    public function index()
    {
        $categories = auth()->user()->categories()
            ->withCount('transaksis')
            ->orderBy('name')
            ->get();

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        // Verify ownership
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Kategori berhasil diupdate.');
    }

    public function destroy(Category $category)
    {
        // Verify ownership
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if category is being used in transactions
        if ($category->transaksis()->count() > 0) {
            return redirect()->route('categories.index')
                ->with('error', 'Kategori tidak dapat dihapus karena masih digunakan dalam transaksi.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
