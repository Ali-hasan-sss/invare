# سير عمل تسجيل الدخول للأدمن - Admin Login Flow

## نظرة عامة سريعة

تم تحديث نظام تسجيل الدخول ليتعرف تلقائياً على الأدمن ويوجههم إلى لوحة التحكم.

---

## سير العمل (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│  المستخدم يدخل Email في صفحة تسجيل الدخول                  │
│  /auth/login                                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  يتم إرسال OTP (للتوضيح فقط - في المشروع حالياً)          │
│  في الوضع الحالي: ينتقل مباشرة لخطوة OTP                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  المستخدم يدخل OTP                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Call: POST /auth/login                                 │
│  Body: { email, otp }                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Response:                                              │
│  {                                                          │
│    "accessToken": "eyJ...",                                 │
│    "user": {                                                │
│      "id": "...",                                           │
│      "email": "admin@invare.com",                           │
│      "firstName": "Admin",                                  │
│      "lastName": "User",                                    │
│      "isAdmin": true  ← مفتاح التحقق                        │
│    }                                                        │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  تخزين البيانات:                                           │
│  ✓ localStorage.setItem("accessToken", ...)                │
│  ✓ localStorage.setItem("user", ...)                       │
│  ✓ document.cookie = "accessToken=..."                     │
│  ✓ document.cookie = "user=..."                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    ┌────┴────┐
                    │ تحقق    │
                    └────┬────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌───────────────────┐          ┌──────────────────┐
│  isAdmin = true?  │          │  isAdmin = false │
│  أو غير موجود     │          │  أو undefined    │
└────────┬──────────┘          └────────┬─────────┘
         │                              │
         ▼                              ▼
┌───────────────────┐          ┌──────────────────┐
│ router.push       │          │ router.push      │
│ ("/admin")        │          │ ("/")            │
│                   │          │                  │
│ → لوحة التحكم     │          │ → الصفحة الرئيسية│
└───────────────────┘          └──────────────────┘
```

---

## الكود المسؤول عن التوجيه

في ملف `src/app/auth/login/page.tsx`:

```typescript
const handleOtpSubmit = async (otp: string) => {
  setLoading(true);
  try {
    // استدعاء API للدخول
    const result = await login({ email, otp });

    // التحقق من نجاح تسجيل الدخول
    if (result && "payload" in result && result.type.includes("fulfilled")) {
      showToast(t("common.success"), "success");

      // ✅ هنا يتم التحقق من isAdmin
      const userData = (result.payload as any)?.user;
      if (userData?.isAdmin) {
        router.push("/admin"); // ← توجيه للأدمن
      } else {
        router.push("/"); // ← توجيه للمستخدمين العاديين
      }
    } else if (authError) {
      showToast(authError, "error");
    } else {
      showToast("Login failed", "error");
    }
  } catch (error) {
    showToast("Login failed", "error");
  } finally {
    setLoading(false);
  }
};
```

---

## مثال على استجابة API

### استجابة ناجحة للأدمن:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZjlmODNhYS1hZTZmLTQ4NmEtOTBkYi0wZjIxZmVlMTYzMzMiLCJlbWFpbCI6ImFkbWluQGludmFyZS5jb20iLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NjE5MzEyMDgsImV4cCI6MTc2MjUzNjAwOH0.O2LtJXde5ZJymMMsukma-dc5vo9qe5rf51dej6b7HAI",
  "user": {
    "id": "9f9f83aa-ae6f-486a-90db-0f21fee16333",
    "email": "admin@invare.com",
    "firstName": "Admin",
    "lastName": "User",
    "isAdmin": true  ✅
  }
}
```

**النتيجة:** توجيه إلى `/admin` ✅

### استجابة ناجحة لمستخدم عادي:

```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "abc123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false  ⚠️
  }
}
```

**النتيجة:** توجيه إلى `/` (الصفحة الرئيسية) ✅

---

## حماية الصفحات

### 1. Middleware Protection (Server-Side)

بعد تفعيل middleware (`src/middleware.ts`):

```
المستخدم يحاول الوصول إلى /admin
           │
           ▼
    ┌──────────────┐
    │  Middleware  │
    │   يتحقق من:  │
    │ 1. accessToken│
    │ 2. user data │
    │ 3. isAdmin   │
    └──────┬───────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
✅ isAdmin      ❌ !isAdmin
    │             │
    ▼             ▼
السماح       إعادة توجيه
بالدخول       إلى /auth/login
              أو /
```

### 2. التحقق من البيانات المخزنة

```typescript
// في أي مكان في التطبيق
import AuthService from "@/services/authService";

if (AuthService.isAdmin()) {
  // المستخدم أدمن
  console.log("Welcome, Admin!");
} else {
  // مستخدم عادي
  console.log("Welcome, User!");
}
```

---

## أمثلة على الاستخدام

### مثال 1: إظهار رابط لوحة التحكم في Header

```typescript
import AuthService from "@/services/authService";
import Link from "next/link";

export function Header() {
  const isAdmin = AuthService.isAdmin();

  return (
    <header>
      <nav>
        <Link href="/">الرئيسية</Link>

        {isAdmin && (
          <Link href="/admin" className="admin-link">
            🔧 لوحة التحكم
          </Link>
        )}
      </nav>
    </header>
  );
}
```

### مثال 2: حماية مكون معين

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/authService";

export function AdminOnlyComponent() {
  const router = useRouter();

  useEffect(() => {
    if (!AuthService.isAdmin()) {
      router.push("/");
    }
  }, [router]);

  if (!AuthService.isAdmin()) {
    return null;
  }

  return <div>محتوى خاص بالأدمن فقط</div>;
}
```

---

## الاختبار

### سيناريو 1: تسجيل دخول كأدمن ✅

```bash
1. افتح http://localhost:3000/auth/login
2. أدخل email: admin@invare.com
3. أدخل OTP: (أي رمز في الوضع الحالي)
4. اضغط تحقق
5. ✅ يجب أن يتم توجيهك إلى http://localhost:3000/admin
```

### سيناريو 2: تسجيل دخول كمستخدم عادي ✅

```bash
1. افتح http://localhost:3000/auth/login
2. أدخل email: user@example.com
3. أدخل OTP: (أي رمز)
4. اضغط تحقق
5. ✅ يجب أن يتم توجيهك إلى http://localhost:3000/
```

### سيناريو 3: محاولة الوصول المباشر لـ /admin (بدون تسجيل دخول) ⚠️

```bash
# بدون تفعيل middleware:
1. افتح http://localhost:3000/admin
2. ⚠️ يمكنك الدخول (غير آمن!)

# بعد تفعيل middleware:
1. افتح http://localhost:3000/admin
2. ✅ يتم توجيهك إلى http://localhost:3000/auth/login
```

### سيناريو 4: محاولة دخول مستخدم عادي لـ /admin ⚠️

```bash
# بعد تفعيل middleware:
1. سجل دخول كمستخدم عادي (isAdmin: false)
2. حاول الوصول إلى http://localhost:3000/admin
3. ✅ يتم توجيهك إلى http://localhost:3000/
```

---

## نصائح مهمة

### ✅ يجب عمله:

- تفعيل middleware لحماية صفحات الأدمن
- التحقق من `isAdmin` في Backend API أيضاً
- اختبار جميع السيناريوهات قبل النشر

### ❌ لا تفعل:

- الاعتماد فقط على حماية Frontend
- تخزين معلومات حساسة في localStorage
- السماح بالوصول إلى API endpoints بدون تحقق من Backend

---

## ملفات ذات صلة

- `src/app/auth/login/page.tsx` - صفحة تسجيل الدخول
- `src/store/slices/authSlice.ts` - Redux slice للمصادقة
- `src/services/authService.ts` - خدمات المصادقة
- `src/middleware.example.ts` - Middleware للحماية (يحتاج تفعيل)
- `docs/ADMIN_AUTH_SETUP.md` - دليل الإعداد الكامل

---

تم الإنشاء في: October 31, 2025
