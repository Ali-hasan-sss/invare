# نظام المصادقة والحساب - Invare

هذا النظام يوفر إدارة شاملة للمصادقة والحساب باستخدام Redux Toolkit و Axios.

## البنية

```
src/
├── config/
│   └── api.ts                 # إعدادات API
├── lib/
│   └── apiClient.ts           # Axios instance
├── services/
│   └── authService.ts         # خدمة المصادقة
├── store/
│   └── slices/
│       └── authSlice.ts       # Redux slice للمصادقة
├── hooks/
│   └── useAuth.ts             # React hooks للمصادقة
└── components/
    └── AuthProvider.tsx       # مكون تهيئة المصادقة
```

## الاستخدام

### 1. استخدام Hook المصادقة الرئيسي

```tsx
import { useAuth } from "@/hooks/useAuth";

function LoginComponent() {
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const handleLogin = async (email: string, otp: string) => {
    try {
      await login({ email, otp });
      // تم تسجيل الدخول بنجاح
    } catch (error) {
      // معالجة الخطأ
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>مرحباً، تم تسجيل الدخول!</p>
      ) : (
        <button onClick={() => handleLogin("user@example.com", "123456")}>
          تسجيل الدخول
        </button>
      )}
      {isLoading && <p>جاري التحميل...</p>}
      {error && <p>خطأ: {error}</p>}
    </div>
  );
}
```

### 2. تسجيل مستخدم جديد

```tsx
import { useAuth } from "@/hooks/useAuth";

function RegisterComponent() {
  const { registerUser, isLoading, error } = useAuth();

  const handleRegister = async () => {
    try {
      await registerUser({
        email: "new@example.com",
        firstName: "أحمد",
        lastName: "محمد",
        countryId: "uuid-optional",
      });
      // تم التسجيل بنجاح
    } catch (error) {
      // معالجة الخطأ
    }
  };

  return (
    <button onClick={handleRegister} disabled={isLoading}>
      {isLoading ? "جاري التسجيل..." : "تسجيل مستخدم جديد"}
    </button>
  );
}
```

### 3. تسجيل شركة جديدة

```tsx
import { useAuth } from "@/hooks/useAuth";

function CompanyRegisterComponent() {
  const { registerCompany, isLoading, error } = useAuth();

  const handleCompanyRegister = async () => {
    try {
      await registerCompany({
        companyName: "شركة المثال",
        vatNumber: "TR1234567",
        website: "example.com",
        countryId: "uuid-optional",
      });
      // تم تسجيل الشركة بنجاح
    } catch (error) {
      // معالجة الخطأ
    }
  };

  return (
    <button onClick={handleCompanyRegister} disabled={isLoading}>
      {isLoading ? "جاري التسجيل..." : "تسجيل شركة جديدة"}
    </button>
  );
}
```

### 4. استخدام Hooks المتخصصة

```tsx
import { useAuthStatus, useUser, useAuthActions } from "@/hooks/useAuth";

function DashboardComponent() {
  const { isAuthenticated, isLoggedIn } = useAuthStatus();
  const { user, company } = useUser();
  const { logout } = useAuthActions();

  if (!isLoggedIn) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  return (
    <div>
      <h1>مرحباً {user?.firstName}</h1>
      {company && <p>الشركة: {company.companyName}</p>}
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
}
```

### 5. استخدام خدمة المصادقة مباشرة

```tsx
import { AuthService } from "@/services/authService";

// تسجيل الدخول
const loginData = await AuthService.login({
  email: "user@example.com",
  otp: "123456",
});

// التحقق من حالة المصادقة
const isAuth = AuthService.isAuthenticated();

// الحصول على المستخدم الحالي
const user = AuthService.getStoredUser();

// تسجيل الخروج
AuthService.logout();
```

## API Endpoints

هذا النظام يتصل مباشرة بالـ backend الخارجي عبر Axios. جميع الطلبات تُرسل إلى:

**Base URL**: `https://invare-back-end.onrender.com/api`

### تسجيل الدخول

- **POST** `https://invare-back-end.onrender.com/api/auth/login`
- **Body**: `{ email: string, otp: string }`
- **Response**: `{ accessToken: string, user: { id: string, email: string } }`

### تسجيل مستخدم جديد

- **POST** `https://invare-back-end.onrender.com/api/auth/register/user`
- **Body**: `{ email: string, firstName: string, lastName: string, countryId?: string }`
- **Response**: `{ id: string, email: string }`

### تسجيل شركة جديدة

- **POST** `https://invare-back-end.onrender.com/api/auth/register/company`
- **Body**: `{ companyName: string, vatNumber: string, website: string, countryId?: string }`
- **Response**: `{ id: string, email: string }`

### الحصول على بيانات المستخدم الحالي

- **GET** `https://invare-back-end.onrender.com/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ user: { id: string, email: string } }`

## الميزات

- ✅ إدارة حالة المصادقة مع Redux Toolkit
- ✅ تخزين آمن للتوكن في localStorage
- ✅ معالجة تلقائية للأخطاء
- ✅ Hooks متخصصة للاستخدام السهل
- ✅ دعم تسجيل المستخدمين والشركات
- ✅ تهيئة تلقائية للحالة عند تحميل التطبيق
- ✅ معالجة انتهاء صلاحية التوكن
- ✅ TypeScript support كامل
- ✅ اتصال مباشر بالـ backend الخارجي عبر Axios
- ✅ معالجة تلقائية للتوكن في الطلبات

## التكوين

يتم تكوين API base URL في `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: "https://invare-back-end.onrender.com/api",
  // ...
};
```

يمكن تغيير هذا الرابط حسب البيئة (تطوير، إنتاج، اختبار).
