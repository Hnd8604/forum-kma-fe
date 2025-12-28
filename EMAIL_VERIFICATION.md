# Email Verification Feature

## Overview
Email verification functionality with 2-step OTP process for newly created accounts.

## API Endpoints

### 1. Send OTP
**Endpoint:** `POST /auth/verify-email`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "code": 200,
  "message": "OTP sent",
  "data": "OTP sent successfully"
}
```

### 2. Complete Verification
**Endpoint:** `POST /auth/verify-email/complete`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "otp": "string"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Email verified successfully",
  "data": "Email verification completed"
}
```

## Implementation

### Files Created/Modified

1. **Service Layer**
   - `src/features/auth/services/email-verification.service.ts` - API calls for email verification

2. **Component Layer**
   - `src/features/auth/components/EmailVerificationDialog.tsx` - Dialog with 2-step stepper UI

3. **Types**
   - `src/features/auth/types/auth.types.ts` - Added verification types

4. **Integration**
   - `src/features/auth/components/SettingsPage.tsx` - Added verification option in settings
   - `src/features/auth/components/RegisterPage.tsx` - Auto-show verification after registration
   - `src/features/auth/index.ts` - Export verification components

## Features

### EmailVerificationDialog Component

The dialog implements a 2-step verification process:

**Step 1: Password Confirmation**
- User enters their current password
- Clicks "Gửi OTP" to request OTP
- System sends OTP to user's registered email

**Step 2: OTP Verification**
- User enters 6-digit OTP received via email
- Clicks "Xác thực" to complete verification
- Shows success message on completion

### UI Features

- **Stepper UI**: Visual indicator showing current step
- **Form Validation**: Password and OTP validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Disabled inputs during API calls
- **Auto-navigation**: Automatic step progression
- **Keyboard Support**: Enter key submission

### Integration Points

1. **After Registration**: Dialog automatically appears after successful registration
2. **Settings Page**: Manual verification trigger in account security settings
3. **Any Component**: Can be imported and used anywhere with:
   ```tsx
   import { EmailVerificationDialog } from '@/features/auth';
   ```

## Usage Examples

### In Settings Page
```tsx
<EmailVerificationDialog
  isOpen={isEmailVerificationOpen}
  onClose={() => setIsEmailVerificationOpen(false)}
  onVerificationComplete={() => {
    // Handle successful verification
    console.log('Email verified!');
  }}
/>
```

### After Registration
Automatically triggered in RegisterPage component when registration succeeds.

## Design Pattern

The component follows the same design pattern shown in the reference image:
- Two-step stepper navigation
- Password confirmation first
- OTP verification second
- Clean, modern UI with proper spacing
- Vietnamese language support
- Responsive design
