<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'regex:/^[\w\.-]+@aust\.edu$/i',
                'exists:users,email'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'We cannot find an account with that email address.',
            'email.regex' => 'Please use your AUST email address (@aust.edu).',
        ];
    }
}