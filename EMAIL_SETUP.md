# Email Setup Guide

This guide will help you set up the feedback email system using Gmail's SMTP.

## Prerequisites

1. A Gmail account
2. 2-Factor Authentication enabled on your Gmail account

## Step 1: Generate an App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification"
3. Scroll down and click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character password that appears

## Step 2: Set Environment Variables

Create a `.env.local` file in the `studio` directory with the following variables:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Optional: Email address to receive feedback (defaults to GMAIL_USER if not set)
FEEDBACK_EMAIL=your-personal-email@example.com
```

## Step 3: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the standings page
3. Click "Give Feedback" and submit a test rating
4. Check your email for the feedback message

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Use App Passwords instead of your regular Gmail password
- App Passwords are more secure and can be revoked individually

## Troubleshooting

### "Invalid login" error
- Make sure 2-Factor Authentication is enabled
- Verify you're using the App Password, not your regular password
- Check that the GMAIL_USER is correct

### "Authentication failed" error
- Regenerate your App Password
- Make sure you copied all 16 characters correctly

### Emails not sending
- Check your internet connection
- Verify the environment variables are loaded correctly
- Check the browser console and server logs for errors 