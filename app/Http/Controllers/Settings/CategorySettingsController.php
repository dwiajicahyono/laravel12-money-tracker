<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategorySettingsController extends Controller
{
    public function index()
    {
        $categories = auth()->user()->categories()->orderBy('name')->get();

        return Inertia::render('settings/categories', [
            'categories' => $categories,
        ]);
    }

    public function destroy(Category $category)
    {
        // Verify ownership
        if ($category->user_id !== auth()->id()) {
            abort(403);
        }

        $category->delete();

        return redirect()->route('categories.settings.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
