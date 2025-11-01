# Admin Authentication & Authorization Setup

## إعداد المصادقة والتفويض للأدمن

---

## التحديثات التي تم إجراؤها

### 1. تحديث واجهة User في authSlice

تمت إضافة حقل `isAdmin` إلى واجهة User:

```typescript
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isAdmin?: boolean; // ✅ تم الإضافة
}
```

### 2. تحديث صفحة تسجيل الدخول

تم تحديث صفحة تسجيل الدخول للتحقق من `isAdmin` وتوجيه المستخدم تلقائياً:

```typescript
// src/app/auth/login/page.tsx
const handleOtpSubmit = async (otp: string) => {
  // ... كود تسجيل الدخول

  // التحقق من دور المستخدم والتوجيه المناسب
  const userData = (result.payload as any)?.user;
  if (userData?.isAdmin) {
    router.push("/admin"); // توجيه إلى لوحة التحكم
  } else {
    router.push("/"); // توجيه إلى الصفحة الرئيسية
  }
};
```

### 3. إضافة دالة للتحقق من الأدمن في authService

```typescript
// src/services/authService.ts
static isAdmin(): boolean {
  const user = this.getStoredUser();
  return user?.isAdmin === true;
}
```

### 4. تخزين البيانات في Cookies

تم تحديث `authSlice.ts` لتخزين بيانات المستخدم في cookies بالإضافة إلى localStorage:

```typescript
// تخزين في localStorage و Cookies
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("user", JSON.stringify(data.user));

// تخزين في cookies للوصول من Middleware
document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${
  7 * 24 * 60 * 60
}`;
document.cookie = `user=${encodeURIComponent(
  JSON.stringify(data.user)
)}; path=/; max-age=${7 * 24 * 60 * 60}`;
```

---

## كيفية تفعيل حماية صفحات الأدمن

### الطريقة 1: تفعيل Middleware (موصى به)

1. **إعادة تسمية الملف**:

   ```bash
   mv src/middleware.example.ts src/middleware.ts
   ```

2. **كيف يعمل Middleware**:

   - يتحقق من وجود `accessToken` في cookies
   - يتحقق من وجود بيانات المستخدم في cookies
   - يتحقق من أن `isAdmin = true`
   - يوجه المستخدمين غير المصرح لهم إلى:
     - `/auth/login` إذا لم يكونوا مسجلين دخول
     - `/` (الصفحة الرئيسية) إذا لم يكونوا أدمن

3. **المسارات المحمية**:
   ```typescript
   export const config = {
     matcher: [
       "/admin/:path*", // جميع صفحات الأدمن
     ],
   };
   ```

### الطريقة 2: حماية جانب العميل (Client-Side)

يمكنك أيضاً إضافة حماية في كل صفحة أدمن:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthService from "@/services/authService";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // التحقق من تسجيل الدخول
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // التحقق من دور الأدمن
    if (!user?.isAdmin) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  // محتوى الصفحة
  return <div>Admin Content</div>;
}
```

---

## استجابة API المتوقعة

يجب أن تتضمن استجابة تسجيل الدخول من API حقل `isAdmin`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "9f9f83aa-ae6f-486a-90db-0f21fee16333",
    "email": "admin@invare.com",
    "firstName": "Admin",
    "lastName": "User",
    "isAdmin": true // ✅ مطلوب
  }
}
```

---

## الاختبار

### اختبار تسجيل الدخول كأدمن:

1. سجل دخول بحساب أدمن (`isAdmin: true`)
2. يجب أن يتم توجيهك تلقائياً إلى `/admin`
3. يجب أن ترى لوحة التحكم

### اختبار تسجيل الدخول كمستخدم عادي:

1. سجل دخول بحساب عادي (`isAdmin: false` أو غير موجود)
2. يجب أن يتم توجيهك إلى `/`
3. إذا حاولت الوصول إلى `/admin` يدوياً:
   - مع Middleware: سيتم توجيهك إلى `/`
   - بدون Middleware: يمكنك الوصول (غير آمن)

### اختبار بدون تسجيل دخول:

1. حاول الوصول إلى `/admin` بدون تسجيل دخول
2. مع Middleware: سيتم توجيهك إلى `/auth/login`
3. بدون Middleware: يمكنك الوصول (غير آمن)

---

## استخدام دالة isAdmin

يمكنك استخدام دالة `isAdmin()` في أي مكان:

```typescript
import AuthService from "@/services/authService";

// التحقق من كون المستخدم أدمن
if (AuthService.isAdmin()) {
  // عرض خيارات الأدمن
  console.log("User is admin");
} else {
  // عرض خيارات عادية
  console.log("Regular user");
}
```

---

## إضافة رابط لوحة التحكم في Header

يمكنك إضافة رابط في Header يظهر فقط للأدمن:

```typescript
import AuthService from "@/services/authService";
import Link from "next/link";

export function Header() {
  const isAdmin = AuthService.isAdmin();

  return (
    <header>
      {/* عناصر Header الأخرى */}

      {isAdmin && <Link href="/admin">لوحة التحكم</Link>}
    </header>
  );
}
```

---

## الأمان الإضافي

### Backend Validation (مهم جداً!)

**⚠️ تحذير:** الحماية جانب العميل والـ Middleware ليست كافية وحدها!

يجب **دائماً** التحقق من صلاحيات الأدمن في Backend API:

```javascript
// مثال في Backend (Node.js/Express)
function requireAdmin(req, res, next) {
  const user = req.user; // من JWT token

  if (!user || !user.isAdmin) {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
}

// حماية endpoints الأدمن
router.get("/api/admin/users", requireAdmin, getUsersController);
router.delete("/api/admin/users/:id", requireAdmin, deleteUserController);
```

---

## حل المشاكل الشائعة

### المشكلة: يتم توجيهي إلى الصفحة الرئيسية بدلاً من لوحة التحكم

**الحل:**

- تحقق من أن `isAdmin: true` في استجابة API
- تحقق من console للأخطاء
- تحقق من localStorage: `localStorage.getItem('user')`

### المشكلة: يمكنني الوصول إلى `/admin` بدون تسجيل دخول

**الحل:**

- تأكد من تفعيل middleware (إعادة تسمية `middleware.example.ts` إلى `middleware.ts`)
- أعد تشغيل السيرفر بعد تفعيل middleware

### المشكلة: Middleware لا يعمل

**الحل:**

- تحقق من أن الملف اسمه `middleware.ts` وليس `middleware.example.ts`
- تحقق من أن الملف في مجلد `src/`
- أعد تشغيل السيرفر: `npm run dev`

---

## الخلاصة

✅ **تم تنفيذه:**

- تحديث User interface لتشمل `isAdmin`
- توجيه تلقائي للأدمن بعد تسجيل الدخول
- تخزين البيانات في cookies و localStorage
- دالة `isAdmin()` للتحقق السريع
- Middleware جاهز للتفعيل

⚠️ **مطلوب منك:**

- تفعيل middleware (إعادة تسمية الملف)
- التحقق من أن API يرجع `isAdmin` في استجابة تسجيل الدخول
- إضافة حماية في Backend للـ endpoints

---

تم التحديث في: October 31, 2025
