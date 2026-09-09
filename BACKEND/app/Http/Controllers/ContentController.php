<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContentController extends Controller
{
    /**
     * Display a paginated listing of contents with search/filtering.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('per_page', 10);

        if ($page < 1) {
            $page = 1;
        }
        if ($perPage < 1) {
            $perPage = 10;
        } elseif ($perPage > 100) {
            $perPage = 100;
        }

        $query = Content::query()
            ->where('content_status', 1)
            ->orderBy('content_create_date', 'desc');

        if (!empty($search)) {
            $search = trim($search);
            $query->where(function ($q) use ($search) {
                $q->where('content_title', 'ILIKE', "%{$search}%")
                  ->orWhere('content_description', 'ILIKE', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'message' => 'Daftar konten berhasil diambil',
            'data' => [
                'items' => $paginator->items(),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created content in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content_title' => 'required|string|max:255',
            'content_description' => 'nullable|string',
            'content_category' => 'nullable|string|max:100',
        ], [
            'content_title.required' => 'Judul konten wajib diisi.',
            'content_title.max' => 'Judul konten maksimal 255 karakter.',
            'content_category.max' => 'Kategori konten maksimal 100 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors(),
            ], 422);
        }

        $content = Content::create([
            'content_title' => $request->input('content_title'),
            'content_description' => $request->input('content_description'),
            'content_category' => $request->input('content_category'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konten berhasil dibuat',
            'data' => $content,
        ], 201);
    }

    /**
     * Display the specified content.
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        $content = Content::where('content_id', $id)
            ->where('content_status', 1)
            ->first();

        if (!$content) {
            return response()->json([
                'success' => false,
                'message' => 'Konten tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail konten berhasil diambil',
            'data' => $content,
        ]);
    }

    /**
     * Update the specified content in storage.
     *
     * @param Request $request
     * @param int|string $id
     * @return JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $content = Content::where('content_id', $id)
            ->where('content_status', 1)
            ->first();

        if (!$content) {
            return response()->json([
                'success' => false,
                'message' => 'Konten tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'content_title' => 'required|string|max:255',
            'content_description' => 'nullable|string',
            'content_category' => 'nullable|string|max:100',
        ], [
            'content_title.required' => 'Judul konten wajib diisi.',
            'content_title.max' => 'Judul konten maksimal 255 karakter.',
            'content_category.max' => 'Kategori konten maksimal 100 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors(),
            ], 422);
        }

        $content->update([
            'content_title' => $request->input('content_title'),
            'content_description' => $request->input('content_description'),
            'content_category' => $request->input('content_category'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konten berhasil diperbarui',
            'data' => $content,
        ]);
    }

    /**
     * Remove the specified content from storage (soft delete).
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $content = Content::where('content_id', $id)
            ->where('content_status', 1)
            ->first();

        if (!$content) {
            return response()->json([
                'success' => false,
                'message' => 'Konten tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $content->update([
            'content_status' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konten berhasil dihapus',
            'data' => null,
        ]);
    }
}
