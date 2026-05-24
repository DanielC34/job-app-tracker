# Supabase Password Reset Setup Guide

## Required Configuration

To enable the password reset flow, configure the following in your Supabase Dashboard:

### 1. Site URL Configuration

**Location**: Authentication → URL Configuration

Set your **Site URL** to your application's URL:
- **Development**: `http://localhost:5173`
- **Production**: `https://yourdomain.com`

### 2. Redirect URLs

**Location**: Authentication → URL Configuration → Redirect URLs

Add the following URLs:

**Development**:
```
http://localhost:5173/reset-password
```

**Production**:
```
https://yourdomain.com/reset-password
```

### 3. Email Templates (Optional)

**Location**: Authentication → Email Templates → Reset Password

You can customize the password reset email template. The default template works fine, but you can:
- Add your branding/logo
- Customize the message
- Change the button text
- Adjust styling

**Important**: Keep the `{{ .ConfirmationURL }}` variable - this is the reset link.

### 4. Email Provider (If not configured)

**Location**: Authentication → Email

Supabase provides a default email service, but for production, you should configure your own SMTP provider:

**Recommended Providers**:
- SendGrid
- AWS SES
- Mailgun
- Postmark

**Why?**: Better deliverability, custom domain, higher sending limits.

## Verification Steps

After configuration, verify the setup:

1. **Test Password Reset Request**:
   - Go to `/forgot-password`
   - Enter a valid email
   - Check if email is received

2. **Test Reset Link**:
   - Click the link in the email
   - Verify redirect to `/reset-password`
   - Confirm the page loads correctly

3. **Test Password Update**:
   - Enter new password
   - Confirm password matches
   - Submit form
   - Verify redirect to dashboard

## Common Configuration Issues

### Issue: Email not received

**Possible Causes**:
1. Email service not configured
2. Email in spam folder
3. Invalid email address
4. Supabase email quota exceeded

**Solutions**:
- Check Supabase logs (Authentication → Logs)
- Configure custom SMTP provider
- Check spam/junk folder
- Verify email address is correct

### Issue: Reset link doesn't work

**Possible Causes**:
1. Redirect URL not configured
2. Site URL mismatch
3. Link expired (1 hour limit)

**Solutions**:
- Add redirect URL to Supabase settings
- Ensure Site URL matches your domain
- Request a new reset link

### Issue: "Invalid reset link" error

**Possible Causes**:
1. Link already used
2. Link expired
3. Session mismatch

**Solutions**:
- Request a new reset link
- Clear browser cookies/cache
- Try in incognito mode

## Security Settings

### Email Rate Limiting

**Location**: Authentication → Rate Limits

Configure rate limits to prevent abuse:
- **Password Reset Requests**: 5 per hour per IP (recommended)
- **Email Confirmations**: 10 per hour per IP (recommended)

### Password Requirements

**Location**: Authentication → Policies

Configure password requirements:
- **Minimum Length**: 6 characters (default, can increase)
- **Complexity**: Optional (uppercase, numbers, symbols)

## Production Checklist

Before deploying to production:

- [ ] Configure custom SMTP provider
- [ ] Set production Site URL
- [ ] Add production Redirect URLs
- [ ] Customize email templates with branding
- [ ] Test password reset flow end-to-end
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts for email delivery
- [ ] Enable HTTPS (required for security)
- [ ] Test on multiple devices/browsers
- [ ] Document the flow for your team

## Monitoring

### Key Metrics to Track

1. **Email Delivery Rate**: Monitor in Supabase logs
2. **Reset Success Rate**: Track successful password resets
3. **Failed Attempts**: Monitor for potential abuse
4. **Link Expiration**: Track how many links expire unused

### Supabase Logs

**Location**: Authentication → Logs

Monitor for:
- `auth.password_recovery` - Reset requests
- `auth.user.updated` - Successful password updates
- Errors or failures

## Support

If you encounter issues:

1. **Check Supabase Docs**: https://supabase.com/docs/guides/auth/passwords
2. **Supabase Discord**: https://discord.supabase.com
3. **GitHub Issues**: https://github.com/supabase/supabase/issues

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
