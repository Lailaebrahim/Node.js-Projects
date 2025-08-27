export const forgetPassword = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        
        <p>Hello,</p>
        
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3498db;">{{resetLink}}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        </p>
    </div>
</body>
</html>
`;