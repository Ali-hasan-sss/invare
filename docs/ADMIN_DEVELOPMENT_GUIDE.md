# Admin Panel Development Guide

## دليل تطوير لوحة التحكم

هذا الدليل موجه للمطورين الذين يرغبون في إضافة ميزات جديدة أو تعديل لوحة التحكم.

---

## إضافة صفحة جديدة

### الخطوة 1: إنشاء الصفحة

قم بإنشاء ملف جديد في مجلد `src/app/admin/`:

```typescript
// src/app/admin/orders/page.tsx
"use client";

import React, { useEffect } from "react";
import { useTranslation } from "../../../hooks/useTranslation";

export default function OrdersManagement() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t("admin.ordersManagement")}
      </h1>
      {/* محتوى الصفحة هنا */}
    </div>
  );
}
```

### الخطوة 2: إضافة الصفحة للقائمة الجانبية

قم بتعديل `src/components/admin/AdminLayout.tsx`:

```typescript
const navigation = [
  // ... العناصر الموجودة
  {
    name: t("admin.orders"),
    href: "/admin/orders",
    icon: ShoppingCart, // استيراد من lucide-react
    current: pathname.startsWith("/admin/orders"),
  },
];
```

### الخطوة 3: إضافة الترجمات

أضف الترجمات في `src/locales/ar.json` و `src/locales/en.json`:

```json
{
  "admin": {
    // ... الترجمات الموجودة
    "orders": "الطلبات",
    "ordersManagement": "إدارة الطلبات"
  }
}
```

---

## إنشاء نموذج (Form) جديد

### مثال: نموذج إضافة/تعديل طلب

```typescript
// src/components/admin/OrderFormDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSubmit: (data: CreateOrderData) => Promise<void>;
  isLoading?: boolean;
}

export const OrderFormDialog: React.FC<OrderFormDialogProps> = ({
  open,
  onOpenChange,
  order,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    // حقول النموذج
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {order ? t("admin.editOrder") : t("admin.addOrder")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* حقول النموذج */}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("admin.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("admin.loading") : t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

---

## استخدام الـ Hooks

### إنشاء Hook جديد

```typescript
// src/hooks/useOrders.ts
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../store/slices/ordersSlice";

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const ordersState = useAppSelector((state) => state.orders);

  const fetchOrders = useCallback(async () => {
    return dispatch(getOrders());
  }, [dispatch]);

  const addOrder = useCallback(
    async (orderData) => {
      return dispatch(createOrder(orderData));
    },
    [dispatch]
  );

  // ... المزيد من الدوال

  return {
    orders: ordersState.orders,
    isLoading: ordersState.isLoading,
    error: ordersState.error,
    getOrders: fetchOrders,
    createOrder: addOrder,
    // ...
  };
};
```

---

## إنشاء Redux Slice جديد

```typescript
// src/store/slices/ordersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

export interface Order {
  id: string;
  // حقول الطلب
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.LIST);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
```

لا تنسَ إضافة الـ slice في `src/store/index.ts`:

```typescript
import ordersReducer from "./slices/ordersSlice";

export const store = configureStore({
  reducer: {
    // ... reducers موجودة
    orders: ordersReducer,
  },
});
```

---

## مكونات UI المتاحة

### 1. Table (الجداول)

```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>العمود 1</TableHead>
      <TableHead>العمود 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>بيانات 1</TableCell>
      <TableCell>بيانات 2</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

### 2. Dialog (النوافذ المنبثقة)

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent onClose={() => setOpen(false)}>
    <DialogHeader>
      <DialogTitle>عنوان النافذة</DialogTitle>
    </DialogHeader>
    {/* المحتوى */}
  </DialogContent>
</Dialog>;
```

### 3. Badge (الشارات)

```typescript
import { Badge } from '../ui/Badge';

<Badge variant="success">نشط</Badge>
<Badge variant="error">غير نشط</Badge>
<Badge variant="warning">معلق</Badge>
<Badge variant="info">معلومات</Badge>
```

### 4. Button (الأزرار)

```typescript
import { Button } from '../ui/Button';

<Button variant="primary">زر رئيسي</Button>
<Button variant="secondary">زر ثانوي</Button>
<Button variant="destructive">حذف</Button>
<Button size="sm">صغير</Button>
<Button size="lg">كبير</Button>
<Button loading>جاري التحميل...</Button>
```

### 5. Select (القوائم المنسدلة)

```typescript
import { Select, SelectOption } from "../ui/Select";

<Select name="status" value={status} onChange={handleChange}>
  <SelectOption value="active">نشط</SelectOption>
  <SelectOption value="inactive">غير نشط</SelectOption>
</Select>;
```

### 6. Card (البطاقات)

```typescript
import { Card } from "../ui/Card";

<Card className="p-6">{/* المحتوى */}</Card>;
```

### 7. Toast (الإشعارات)

```typescript
import { Toast } from "../ui/Toast";

const [toast, setToast] = useState(null);

{
  toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  );
}
```

---

## أفضل الممارسات

### 1. State Management

- استخدم Redux للحالة المشتركة
- استخدم useState للحالة المحلية
- استخدم useEffect بحذر وحدد dependencies

### 2. Error Handling

```typescript
try {
  await someOperation();
  setToast({ message: t("success"), type: "success" });
} catch (error) {
  setToast({ message: t("error"), type: "error" });
}
```

### 3. Loading States

عرض حالة التحميل دائماً:

```typescript
{
  isLoading ? <div>Loading...</div> : <div>{/* المحتوى */}</div>;
}
```

### 4. Responsive Design

استخدم Tailwind classes:

```typescript
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
```

### 5. Dark Mode Support

استخدم دائماً:

```typescript
className = "text-gray-900 dark:text-white";
className = "bg-white dark:bg-gray-800";
```

### 6. Translations

استخدم دائماً الترجمات:

```typescript
const { t } = useTranslation();
<h1>{t("admin.title")}</h1>;
```

### 7. TypeScript

حدد الأنواع دائماً:

```typescript
interface MyComponentProps {
  title: string;
  onSubmit: (data: MyData) => Promise<void>;
}
```

---

## هيكل الملفات

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Layout للأدمن
│       ├── page.tsx            # Dashboard
│       ├── users/
│       │   └── page.tsx        # صفحة المستخدمين
│       └── companies/
│           └── page.tsx        # صفحة الشركات
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── UserFormDialog.tsx
│   │   ├── CompanyFormDialog.tsx
│   │   └── DeleteConfirmDialog.tsx
│   └── ui/
│       ├── Table.tsx
│       ├── Dialog.tsx
│       ├── Button.tsx
│       └── ...
│
├── hooks/
│   ├── useUsers.ts
│   ├── useCompanies.ts
│   └── ...
│
├── store/
│   └── slices/
│       ├── usersSlice.ts
│       ├── companiesSlice.ts
│       └── ...
│
├── config/
│   ├── api.ts
│   └── admin.ts
│
└── locales/
    ├── ar.json
    └── en.json
```

---

## Testing

### Manual Testing Checklist

- [ ] الصفحة تعمل على جميع الأجهزة
- [ ] Dark mode يعمل بشكل صحيح
- [ ] الترجمات موجودة ومكتملة
- [ ] حالات التحميل والأخطاء معالجة
- [ ] النماذج تتحقق من البيانات
- [ ] الـ API calls تعمل بشكل صحيح

---

## الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من console للأخطاء
2. تحقق من Network tab للـ API calls
3. راجع الوثائق
4. تواصل مع فريق التطوير

---

تم إنشاء هذا الدليل في: October 31, 2025
