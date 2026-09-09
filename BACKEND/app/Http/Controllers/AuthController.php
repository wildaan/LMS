<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * User registration.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $email = $request->input('users_email', $request->input('email'));
        $userName = $request->input('users_user_name', $request->input('name', $request->input('user_name')));
        $password = $request->input('users_password', $request->input('password'));
        $passwordConfirmation = $request->input('users_password_confirmation', $request->input('password_confirmation'));

        $validator = Validator::make([
            'users_email' => $email,
            'users_user_name' => $userName,
            'users_password' => $password,
            'users_password_confirmation' => $passwordConfirmation,
        ], [
            'users_email' => ['required', 'email', 'max:255', Rule::unique(User::class, 'users_email')],
            'users_user_name' => 'required|string|max:255',
            'users_password' => 'required|string|min:8|confirmed',
        ], [
            'users_email.required' => 'Email wajib diisi.',
            'users_email.email' => 'Format email tidak valid.',
            'users_email.unique' => 'Email sudah terdaftar.',
            'users_user_name.required' => 'Username wajib diisi.',
            'users_password.required' => 'Password wajib diisi.',
            'users_password.min' => 'Password minimal 8 karakter.',
            'users_password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'users_email' => $email,
            'users_user_name' => $userName,
            'users_password' => Hash::make($password),
        ]);

        UserActivity::logActivity(
            $user->users_uuid,
            'REGISTER',
            'User successfully registered with email: ' . $user->users_email,
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'users_id' => $user->users_id,
                'users_uuid' => $user->users_uuid,
                'users_email' => $user->users_email,
                'users_user_name' => $user->users_user_name,
                'users_status' => $user->users_status,
                'users_create_date' => $user->users_create_date,
            ]
        ], 201);
    }

    /**
     * User login & JWT issuance.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $email = $request->input('users_email', $request->input('email'));
        $password = $request->input('users_password', $request->input('password'));

        $validator = Validator::make([
            'users_email' => $email,
            'users_password' => $password,
        ], [
            'users_email' => 'required|email',
            'users_password' => 'required|string',
        ], [
            'users_email.required' => 'Email wajib diisi.',
            'users_email.email' => 'Format email tidak valid.',
            'users_password.required' => 'Password wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'data' => $validator->errors()
            ], 422);
        }

        $user = User::where('users_email', $email)->first();

        // Check user existence and password hash
        if (!$user || !Hash::check($password, $user->users_password)) {
            UserActivity::logActivity(
                $user?->users_uuid,
                'LOGIN_FAILED',
                'Invalid credentials for email: ' . $email,
                $request
            );

            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
                'data' => null
            ], 401);
        }

        // Check user status (must be active: 1)
        if ((int)$user->users_status !== 1) {
            UserActivity::logActivity(
                $user->users_uuid,
                'LOGIN_FAILED',
                'Account is inactive for email: ' . $email . ' (status: ' . $user->users_status . ')',
                $request
            );

            return response()->json([
                'success' => false,
                'message' => 'Akun tidak aktif, silakan hubungi administrator',
                'data' => null
            ], 403);
        }

        // Issue JWT token
        $token = auth('api')->login($user);

        UserActivity::logActivity(
            $user->users_uuid,
            'LOGIN',
            'User successfully logged in',
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => [
                    'users_id' => $user->users_id,
                    'users_uuid' => $user->users_uuid,
                    'users_email' => $user->users_email,
                    'users_user_name' => $user->users_user_name,
                    'users_status' => $user->users_status,
                ]
            ]
        ]);
    }

    /**
     * User logout & token invalidation.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $uuid = $user?->users_uuid;

            auth('api')->logout();

            if ($uuid) {
                UserActivity::logActivity(
                    $uuid,
                    'LOGOUT',
                    'User logged out',
                    $request
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil',
                'data' => null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal logout: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get authenticated user profile.
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data profil berhasil diambil',
            'data' => [
                'users_id' => $user->users_id,
                'users_uuid' => $user->users_uuid,
                'users_email' => $user->users_email,
                'users_user_name' => $user->users_user_name,
                'users_status' => $user->users_status,
                'users_create_date' => $user->users_create_date,
            ]
        ]);
    }
}
