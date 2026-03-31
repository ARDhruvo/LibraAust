<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: #2563eb;
            margin: 0;
        }

        .otp-box {
            background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }

        .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2563eb;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LibraAust</h1>
    </div>

    <p>Hello {{ $name }},</p>

    <p>We received a request to reset your password for your LibraAust account. Use the OTP code below to complete the
        process:</p>

    <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
        <p>This code will expire in 10 minutes.</p>
    </div>

    <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>

    <div class="footer">
        <p>&copy; {{ date('Y') }} LibraAust. All rights reserved.</p>
    </div>
</body>

</html>