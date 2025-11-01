# User Profile System

## Overview

A comprehensive user profile management system with support for personal information, company registration, and address management. Fully supports Arabic/English localization and RTL/LTR layouts.

## Features

### 1. Personal Information Management

- Edit first name and last name
- View email (read-only)
- Profile picture support (avatar)
- Real-time validation
- Success/error notifications

### 2. Company Registration & Management

- Register a new company (for users without a company)
- Edit existing company information
- Required fields:
  - Company Name
  - VAT Number
  - Website
  - Country (for new registration only)
- View mode for registered companies
- Edit mode toggle

### 3. Address Management

- Separate tabs for user and company addresses
- Add unlimited addresses
- Set default address
- Delete addresses with confirmation
- Address fields:
  - Address Line 1 (required)
  - Address Line 2 (optional)
  - City (required)
  - State/Region (required)
  - Postal Code (required)
  - Country (required)
  - Default flag

## File Structure

```
src/
├── app/
│   └── profile/
│       └── page.tsx              # Main profile page with tabs
├── components/
│   └── profile/
│       ├── UserProfileForm.tsx   # Personal info editor
│       ├── CompanySection.tsx    # Company registration/editing
│       ├── AddressesSection.tsx  # Address management
│       ├── AddressCard.tsx       # Individual address display
│       └── AddressFormDialog.tsx # Add address dialog
├── hooks/
│   ├── useAuth.ts               # Authentication hooks
│   ├── useUsers.ts              # User CRUD operations
│   ├── useCompanies.ts          # Company CRUD operations
│   ├── useUserAddresses.ts      # User address operations
│   ├── useCompanyAddresses.ts   # Company address operations
│   └── useCountries.ts          # Country list operations
└── locales/
    ├── ar.json                  # Arabic translations
    └── en.json                  # English translations
```

## Usage

### Accessing the Profile Page

Navigate to `/profile` when authenticated. Non-authenticated users are redirected to `/auth/login`.

```typescript
// The page automatically handles authentication state
import { useAuth } from "@/hooks/useAuth";
const { user, company, isAuthenticated } = useAuth();
```

### Updating User Information

```typescript
import { useUsers } from "@/hooks/useUsers";

const { updateUser, isLoading } = useUsers();

await updateUser(userId, {
  firstName: "John",
  lastName: "Doe",
});
```

### Registering a Company

```typescript
import { useAuth } from "@/hooks/useAuth";

const { registerCompany } = useAuth();

await registerCompany({
  companyName: "My Company",
  vatNumber: "123456789",
  website: "https://mycompany.com",
  countryId: "country-uuid",
});
```

### Managing Addresses

#### User Addresses

```typescript
import { useUserAddresses } from "@/hooks/useUserAddresses";

const { addresses, getUserAddresses, createUserAddress, deleteUserAddress } =
  useUserAddresses();

// Fetch addresses
await getUserAddresses(userId);

// Create new address
await createUserAddress({
  userId: "user-uuid",
  addressLine1: "123 Main St",
  city: "Muscat",
  state: "Muscat",
  postalCode: "100",
  countryId: "country-uuid",
  isDefault: true,
});

// Delete address
await deleteUserAddress("address-uuid");
```

#### Company Addresses

```typescript
import { useCompanyAddresses } from "@/hooks/useCompanyAddresses";

const {
  addresses,
  getCompanyAddresses,
  createCompanyAddress,
  deleteCompanyAddress,
} = useCompanyAddresses();

// Similar API to user addresses
await createCompanyAddress({
  companyId: "company-uuid",
  addressLine1: "456 Business Ave",
  city: "Salalah",
  state: "Dhofar",
  postalCode: "200",
  countryId: "country-uuid",
  isDefault: false,
});
```

## Components API

### ProfilePage

Main profile page component with tabbed navigation.

```typescript
// Located at /profile
// Automatically handles:
// - Authentication check
// - Tab state management
// - User/company data loading
```

### UserProfileForm

```typescript
interface UserProfileFormProps {
  user: User;
}

// Features:
// - Edit first/last name
// - View-only email
// - Form validation
// - Toast notifications
```

### CompanySection

```typescript
interface CompanySectionProps {
  user: User;
  company: Company | null;
}

// Two modes:
// 1. Registration mode (no company)
// 2. Edit/View mode (has company)
```

### AddressesSection

```typescript
interface AddressesSectionProps {
  user: User;
  company: Company | null;
}

// Features:
// - Tab switching between user/company addresses
// - Address grid display
// - Add/delete operations
// - Empty state handling
```

### AddressCard

```typescript
interface AddressCardProps {
  address: Address;
  onDelete: () => void;
}

// Displays:
// - Full address details
// - Default badge (if applicable)
// - Delete button
```

### AddressFormDialog

```typescript
interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  companyId?: string;
  onSuccess?: () => void;
}

// Features:
// - Add new address
// - Country selection
// - Default flag checkbox
// - Form validation
```

## State Management

All data is managed through Redux Toolkit slices:

- **authSlice**: Current user and company
- **usersSlice**: User CRUD operations
- **companiesSlice**: Company CRUD operations
- **userAddressesSlice**: User address operations
- **companyAddressesSlice**: Company address operations
- **countriesSlice**: Country list

## API Endpoints

### User

- `PATCH /users/:id` - Update user information

### Company

- `POST /auth/register/company` - Register new company
- `PATCH /companies/:id` - Update company information

### Addresses

- `GET /user-addresses/user/:userId` - Get user addresses
- `POST /user-addresses` - Create user address
- `DELETE /user-addresses/:id` - Delete user address
- `GET /company-addresses/company/:companyId` - Get company addresses
- `POST /company-addresses` - Create company address
- `DELETE /company-addresses/:id` - Delete company address

### Countries

- `GET /countries` - Get all countries

## Localization

All text content is fully localized in both Arabic and English:

### Translation Keys

```json
{
  "profile": {
    "myProfile": "My Profile / ملفي الشخصي",
    "personalInfo": "Personal Information / المعلومات الشخصية",
    "companyInfo": "Company Information / معلومات الشركة",
    "addresses": "Addresses / العناوين",
    "editProfile": "Edit Profile / تعديل الملف الشخصي",
    "registerCompany": "Register Company / تسجيل شركة",
    "addAddress": "Add Address / إضافة عنوان"
    // ... and many more
  }
}
```

## RTL Support

All components fully support RTL layout for Arabic:

- Icon positioning (left/right swap)
- Text alignment
- Flex direction
- Tab ordering
- Button groups
- Form layouts

```typescript
const isRTL = currentLanguage.dir === "rtl";

// Example usage
<div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
  {/* Content */}
</div>;
```

## Validation

### User Profile

- First name: Required
- Last name: Required
- Email: Read-only (managed by auth system)

### Company

- Company name: Required
- VAT number: Required
- Website: Required, must be valid URL
- Country: Required (for new registration)

### Address

- Address Line 1: Required
- Address Line 2: Optional
- City: Required
- State: Required
- Postal Code: Required
- Country: Required
- Is Default: Optional boolean

## Error Handling

All operations include comprehensive error handling:

```typescript
try {
  const result = await updateUser(userId, userData);

  if (result.type.endsWith("/fulfilled")) {
    // Show success toast
    setToastMessage(t("profile.profileUpdated"));
    setToastSeverity("success");
  } else {
    throw new Error("Update failed");
  }
} catch (error) {
  // Show error toast
  setToastMessage(t("profile.profileUpdateError"));
  setToastSeverity("error");
}
```

## Styling

Uses Tailwind CSS with dark mode support:

```typescript
// Light mode
className = "bg-gray-50 text-gray-900";

// Dark mode
className = "dark:bg-gray-800 dark:text-white";

// Combined
className = "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white";
```

## Security

- Authentication required for all profile operations
- User can only edit their own profile
- Company data access restricted to company members
- Address operations validated against user/company ownership

## Future Enhancements

Potential improvements:

1. Avatar upload functionality
2. Email change with verification
3. Phone number management
4. Password reset from profile
5. Account deletion
6. Export profile data
7. Activity log
8. Privacy settings
9. Notification preferences
10. Two-factor authentication setup

## Testing

To test the profile system:

1. Login as a user
2. Navigate to `/profile`
3. Edit personal information
4. Register a company (if not already registered)
5. Add user addresses
6. Switch to company tab (if company exists)
7. Add company addresses
8. Delete addresses
9. Set default address
10. Test in both English and Arabic

## Troubleshooting

### Common Issues

**Profile page redirects to login:**

- Ensure user is authenticated
- Check token is valid and not expired

**Company registration fails:**

- Verify all required fields are filled
- Check VAT number format
- Ensure website URL is valid
- Confirm country is selected

**Addresses not loading:**

- Check user/company ID is correct
- Verify API endpoints are accessible
- Check network tab for errors

**Translations not showing:**

- Ensure translation keys exist in both ar.json and en.json
- Check language switching is working
- Verify useTranslation hook is imported correctly

## Dependencies

- React 18+
- Next.js 14+
- Redux Toolkit
- Material-UI
- Tailwind CSS
- lucide-react (icons)

## Related Documentation

- [Authentication System](./AUTH_SYSTEM.md)
- [Company Management](./ADMIN_COMPANIES.md)
- [Localization Guide](./LOCALIZATION.md)
- [RTL Support](./RTL_SUPPORT.md)
