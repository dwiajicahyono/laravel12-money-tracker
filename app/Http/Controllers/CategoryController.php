<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories for the authenticated user
     */
    public function index()
    {
        $categories = auth()->user()->categories()->orderBy('name')->get();

        return response()->json($categories);
    }

    /**
     * Store a new category
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $category = Category::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'icon' => $validated['icon'] ?? null,
        ]);

        return response()->json($category, 201);
    }
}
