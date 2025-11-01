# دعم RTL/LTR في داشبورد الأدمن

## 📋 نظرة عامة

تم تطبيق دعم كامل لتبديل اتجاه واجهة داشبورد الأدمن بناءً على اللغة المختارة (العربية RTL / الإنجليزية LTR).

## ✨ المميزات المطبقة

### 1. **Admin Navbar (النافبار)**

#### Desktop View:

**Arabic (RTL):**

```
┌─────────────────────────────────────────────────────────────┐
│  👤 المستخدم  🌙  🌐                      لوحة التحكم      │
└─────────────────────────────────────────────────────────────┘
```

**English (LTR):**

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard                   🌐  🌙  User 👤          │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile View:

**Arabic (RTL):**

```
┌─────────────────────────────────────┐
│  👤  🌙  🌐        لوحة التحكم  ☰   │
└─────────────────────────────────────┘
```

**English (LTR):**

```
┌─────────────────────────────────────┐
│  ☰ Admin Dashboard    🌐  🌙  👤    │
└─────────────────────────────────────┘
```

### 2. **Sidebar (السايدبار)**

#### Desktop View:

**Arabic (RTL):**

```
┌──────────────┐
│  لوحة التحكم │ ← على اليمين
├──────────────┤
│  👤 المستخدمون  │
│  🏢 الشركات     │
│  🌍 البلدان     │
│  📦 المواد      │
└──────────────┘
```

**English (LTR):**

```
       ┌──────────────┐
على اليسار ← │ Dashboard    │
       ├──────────────┤
       │ 👤 Users      │
       │ 🏢 Companies  │
       │ 🌍 Countries  │
       │ 📦 Materials  │
       └──────────────┘
```

#### Mobile Sidebar:

- ينزلق من **اليمين** في العربية (RTL)
- ينزلق من **اليسار** في الإنجليزية (LTR)

### 3. **Dashboard Content (محتوى الداشبورد)**

#### Stat Cards:

**Arabic (RTL):**

```
┌─────────────────────────┐
│  🔵            100      │
│         إجمالي المستخدمين │
└─────────────────────────┘
```

**English (LTR):**

```
┌─────────────────────────┐
│  100            🔵      │
│  Total Users            │
└─────────────────────────┘
```

#### Quick Actions:

**Arabic (RTL):**

```
┌───────────────────────────┐
│  إدارة المستخدمين       👤 │
│  إضافة، تعديل، أو حذف...   │
└───────────────────────────┘
```

**English (LTR):**

```
┌───────────────────────────┐
│  👤       Users Management │
│  Add, edit, or remove...  │
└───────────────────────────┘
```

## 🏗️ التطبيق التقني

### 1. استخدام CSS Order

بدلاً من `flex-row-reverse` فقط، استخدمنا `order` للتحكم الكامل في ترتيب العناصر:

```tsx
// في النافبار
<div className="flex h-16 items-center justify-between">
  {/* العنوان */}
  <div className={cn("flex items-center", isRTL ? "order-2" : "order-1")}>
    <h1>{t("admin.title")}</h1>
  </div>

  {/* الأزرار */}
  <div
    className={cn(
      "flex items-center gap-2",
      isRTL ? "order-1 flex-row-reverse" : "order-2"
    )}
  >
    <LanguageSwitcher />
    <ThemeToggle />
    <UserMenu />
  </div>
</div>
```

### 2. اتجاه النصوص

```tsx
// للنصوص
className={isRTL ? "text-right" : "text-left"}

// للعناصر المرنة
className={isRTL ? "flex-row-reverse" : ""}
```

### 3. موقع السايدبار

```tsx
// Desktop
className={cn(
  "hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64",
  isRTL ? "lg:right-0" : "lg:left-0"  // اليمين للعربية، اليسار للإنجليزية
)}

// Mobile
className={cn(
  "fixed inset-y-0 flex w-full max-w-xs",
  isRTL ? "right-0" : "left-0"
)}
```

### 4. الحدود (Borders)

```tsx
// حد السايدبار
className={cn(
  "flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800",
  isRTL
    ? "border-l border-gray-200 dark:border-gray-700"  // حد على اليسار للعربية
    : "border-r border-gray-200 dark:border-gray-700"  // حد على اليمين للإنجليزية
)}
```

### 5. المسافات (Padding/Margin)

```tsx
// المحتوى الرئيسي
className={cn(
  "pt-16 lg:pt-0",
  isRTL ? "lg:pr-64" : "lg:pl-64"  // padding-right للعربية، padding-left للإنجليزية
)}
```

## 📝 الملفات المحدثة

### 1. **`src/components/admin/AdminNavbar.tsx`**

```tsx
export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuClick }) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  // استخدام order للتحكم في ترتيب العناصر
  // استخدام flex-row-reverse لعكس اتجاه العناصر الداخلية
};
```

### 2. **`src/components/admin/AdminLayout.tsx`**

```tsx
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  // تطبيق RTL على:
  // - موقع السايدبار (يمين/يسار)
  // - اتجاه عناصر القائمة
  // - اتجاه النصوص
  // - الحدود
  // - المسافات
};
```

### 3. **`src/app/admin/page.tsx`**

```tsx
export default function AdminDashboard() {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  // تطبيق RTL على:
  // - Stat Cards
  // - Quick Actions
  // - اتجاه الأيقونات والنصوص
}
```

### 4. **`src/components/admin/StatCard.tsx`**

```tsx
export const StatCard: React.FC<StatCardProps> = ({ ... }) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === 'rtl';

  // عكس اتجاه الأيقونة والنصوص
}
```

## 🎯 التحسينات

### قبل التحديث ❌:

- السايدبار دائماً على اليمين
- النافبار لا يغير اتجاه العناصر
- النصوص لا تتجاوب مع الاتجاه

### بعد التحديث ✅:

- السايدبار على اليمين للعربية، اليسار للإنجليزية
- النافبار يعكس ترتيب جميع العناصر
- جميع النصوص والأيقونات تتجاوب مع الاتجاه
- تجربة مستخدم متسقة مع باقي الموقع

## 🔄 كيفية عمل التبديل

1. **المستخدم يغير اللغة** من Language Switcher
2. **Redux يحدث حالة اللغة** في Store
3. **useTranslation hook يعيد** `currentLanguage` الجديدة
4. **المكونات تقرأ** `currentLanguage.dir` (rtl أو ltr)
5. **CSS classes تتغير** بناءً على `isRTL`
6. **الواجهة تنعكس** تلقائياً

## ✅ النتيجة النهائية

### Arabic (RTL):

```
┌─────────────────────────────────────────────┐
│  👤  🌙  🌐                 لوحة التحكم     │
├─────────────────────────────────┬───────────┤
│                                 │  القائمة  │
│  المحتوى                        │  ────────  │
│  ←←←                            │  الرئيسية │
│                                 │  المستخدمون│
│                                 │  الشركات  │
└─────────────────────────────────┴───────────┘
```

### English (LTR):

```
┌─────────────────────────────────────────────┐
│  Admin Dashboard                 🌐  🌙  👤 │
├───────────┬─────────────────────────────────┤
│  Menu     │                                 │
│  ────────  │  Content                        │
│  Dashboard│  →→→                            │
│  Users    │                                 │
│  Companies│                                 │
└───────────┴─────────────────────────────────┘
```

## 🎨 أفضل الممارسات المطبقة

1. ✅ استخدام `order` للتحكم في الترتيب بدلاً من الاعتماد فقط على `flex-row-reverse`
2. ✅ فصل منطق RTL/LTR في متغير واحد (`isRTL`)
3. ✅ استخدام `cn()` utility للجمع بين classes بشكل نظيف
4. ✅ تطبيق الاتجاه على جميع المستويات (Layout, Components, Content)
5. ✅ الحفاظ على التناسق في جميع الصفحات
6. ✅ اختبار في كلا الوضعين (RTL & LTR)

## 📊 التغطية

- ✅ Admin Navbar (Desktop & Mobile)
- ✅ Admin Sidebar (Desktop & Mobile)
- ✅ Dashboard Page
- ✅ Stat Cards
- ✅ Quick Actions
- ✅ All Admin Pages inherit RTL support from AdminLayout

جميع عناصر داشبورد الأدمن الآن تدعم تبديل الاتجاه بشكل كامل! 🎉
