<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendOtpRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\PasswordReset;
use App\Models\Users;
use App\Models\Students;
use App\Models\Faculties;
use App\Models\Librarians;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendOtp(SendOtpRequest $request)
    {
        $email = $request->email;

        // Check rate limiting - max 3 attempts per hour
        $recentAttempts = PasswordReset::where('email', $email)
            ->where('created_at', '>', now()->subHour())
            ->count();

        if ($recentAttempts >= 3) {
            return response()->json([
                'message' => 'Too many attempts. Please try again after 1 hour.',
            ], 429);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete any existing unused OTPs for this email
        PasswordReset::where('email', $email)
            ->where('used', false)
            ->delete();

        // Create new OTP record
        PasswordReset::create([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
            'used' => false,
        ]);

        // Get user's name for email
        $user = Users::where('email', $email)->first();
        $name = 'User';

        if ($user->role === 'student') {
            $name = Students::where('email', $email)->value('name') ?? 'User';
        } elseif ($user->role === 'faculty') {
            $name = Faculties::where('email', $email)->value('name') ?? 'User';
        } else {
            $name = Librarians::where('email', $email)->value('name') ?? 'User';
        }

        // Send email
        Mail::to($email)->send(new OtpMail($otp, $name));

        // Always return same message for security
        return response()->json([
            'message' => 'If that email exists in our system, we\'ve sent an OTP code to it.',
        ], 200);
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        $validated = $request->validated();

        // Find valid OTP
        $resetRecord = PasswordReset::where('email', $validated['email'])
            ->where('otp', $validated['otp'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Invalid or expired OTP code.',
            ], 400);
        }

        // Mark as used (or we can keep it and delete later)
        $resetRecord->update(['used' => true]);

        // Generate a temporary verification token (can be JWT or just a random string)
        // For simplicity, we'll just return success and let the next step verify again
        // But for better security, you might want to generate a short-lived token here

        return response()->json([
            'message' => 'OTP verified successfully.',
            'verified' => true,
        ], 200);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $validated = $request->validated();

        // Verify OTP one more time (could be marked as used already)
        $resetRecord = PasswordReset::where('email', $validated['email'])
            ->where('otp', $validated['otp'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Invalid or expired OTP code. Please request a new one.',
            ], 400);
        }

        // Update password
        $user = Users::where('email', $validated['email'])->first();
        $user->update([
            'password_hash' => Hash::make($validated['password'])
        ]);

        // Delete all OTP records for this email
        PasswordReset::where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Password reset successfully. You can now login with your new password.',
        ], 200);
    }
}