# Admin Materials - Listings Display Fix

## Problem

العروض (Listings) لم تكن تظهر في الجدول عند فتح المادة (Material) بسبب عدم تطابق هيكل البيانات بين الكود وما يرجعه الـ API.

## Root Cause

الكود كان يتوقع البيانات بالشكل التالي:

```typescript
{
  company: { name: string },
  price: number,
  quantity: number,
  currency: string
}
```

لكن الـ API يرجع البيانات بالشكل التالي:

```typescript
{
  seller: { companyName: string },
  startingPrice: string,
  stockAmount: number,
  unitOfMeasure: string,
  title: string,
  isBiddable: boolean
}
```

## Solution

تم تحديث صفحة المواد (`src/app/admin/materials/page.tsx`) لتتوافق مع البيانات الفعلية من الـ API:

### 1. تحديث فلترة العروض

**قبل:**

```typescript
const filteredListings = listings.filter(
  (listing) =>
    listing.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.price?.toString().includes(searchQuery)
);
```

**بعد:**

```typescript
const filteredListings = listings.filter(
  (listing) =>
    listing.seller?.companyName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    listing.startingPrice?.toString().includes(searchQuery) ||
    listing.title?.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 2. تحديث عرض الجدول

**قبل:**

```tsx
<TableRow>
  <TableCell>{listing.company?.name || "N/A"}</TableCell>
  <TableCell>{listing.price} {listing.currency}</TableCell>
  <TableCell>{listing.quantity} {selectedMaterial?.unitOfMeasure}</TableCell>
  <TableCell>
    <Badge variant={...}>{listing.status}</Badge>
  </TableCell>
</TableRow>
```

**بعد:**

```tsx
<TableRow>
  <TableCell>{listing.title || "N/A"}</TableCell>
  <TableCell>{listing.seller?.companyName || "N/A"}</TableCell>
  <TableCell>{listing.startingPrice} {t("currency.omr")}</TableCell>
  <TableCell>{listing.stockAmount} {listing.unitOfMeasure}</TableCell>
  <TableCell>
    <Badge variant={...}>{listing.status}</Badge>
  </TableCell>
  <TableCell>
    <Badge variant={listing.isBiddable ? "info" : "secondary"}>
      {listing.isBiddable ? t("listings.biddable") : t("listings.direct")}
    </Badge>
  </TableCell>
</TableRow>
```

## New Features Added

### 1. Additional Column: Listing Title

تمت إضافة عمود "العنوان" لعرض عنوان العرض.

### 2. Additional Column: Listing Type

تمت إضافة عمود "النوع" لعرض ما إذا كان العرض:

- **مزايدة (Auction)**: إذا كان `isBiddable: true`
- **مباشر (Direct Sale)**: إذا كان `isBiddable: false`

### 3. Enhanced Search

البحث الآن يشمل:

- اسم الشركة
- السعر
- عنوان العرض

## Translations Added

### Arabic (`src/locales/ar.json`)

```json
{
  "listings": {
    "title": "العنوان",
    "company": "الشركة",
    "price": "السعر",
    "quantity": "الكمية",
    "status": "الحالة",
    "type": "النوع",
    "noListings": "لا توجد عروض",
    "biddable": "مزايدة",
    "direct": "مباشر"
  },
  "currency": {
    "omr": "ر.ع"
  }
}
```

### English (`src/locales/en.json`)

```json
{
  "listings": {
    "title": "Title",
    "company": "Company",
    "price": "Price",
    "quantity": "Quantity",
    "status": "Status",
    "type": "Type",
    "noListings": "No listings found",
    "biddable": "Auction",
    "direct": "Direct Sale"
  },
  "currency": {
    "omr": "OMR"
  }
}
```

## API Data Structure

البيانات القادمة من الـ API:

```typescript
interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  unitOfMeasure: string;
  startingPrice: string;
  stockAmount: number;
  status: "active" | "pending" | "expired";
  isBiddable: boolean;
  expiresAt: string;
  material: {
    id: string;
    name: string;
    unitOfMeasure: string;
  };
  seller: {
    id: string;
    companyName: string;
    vatNumber: string | null;
    website: string;
    verificationStatus: "pending" | "verified" | "rejected";
  };
  sellerUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountStatus: string;
    isAdmin: boolean;
  };
  photos: Array<{
    id: string;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  attributes: Array<{
    id: string;
    attrKey: string;
    attrValue: string;
  }>;
}
```

## New Table Columns

| Column            | Data                                          | Description                         |
| ----------------- | --------------------------------------------- | ----------------------------------- |
| العنوان (Title)   | `listing.title`                               | عنوان العرض                         |
| الشركة (Company)  | `listing.seller.companyName`                  | اسم الشركة البائعة                  |
| السعر (Price)     | `listing.startingPrice + ر.ع`                 | السعر بالريال العماني               |
| الكمية (Quantity) | `listing.stockAmount + listing.unitOfMeasure` | الكمية مع الوحدة                    |
| الحالة (Status)   | `listing.status`                              | حالة العرض (active/pending/expired) |
| النوع (Type)      | `listing.isBiddable`                          | نوع العرض (مزايدة/مباشر)            |

## Testing

### Test Case 1: View Listings

1. انتقل إلى `/admin/materials`
2. اختر فئة واضغط "عرض المواد"
3. اختر مادة واضغط "عرض العروض"
4. **المتوقع**: يجب أن تظهر جميع العروض في جدول منظم

### Test Case 2: Search Listings

1. في صفحة العروض، اكتب في حقل البحث
2. جرّب البحث بـ:
   - اسم الشركة
   - السعر
   - عنوان العرض
3. **المتوقع**: يجب أن تُفلتر العروض حسب البحث

### Test Case 3: View Listing Details

1. تحقق من أن جميع البيانات تظهر بشكل صحيح:
   - ✅ عنوان العرض
   - ✅ اسم الشركة
   - ✅ السعر مع العملة
   - ✅ الكمية مع الوحدة
   - ✅ حالة العرض (Badge ملون)
   - ✅ نوع العرض (مزايدة/مباشر)

## Files Modified

1. ✅ `src/app/admin/materials/page.tsx`

   - تحديث منطق الفلترة
   - تحديث عرض الجدول
   - إضافة أعمدة جديدة

2. ✅ `src/locales/ar.json`

   - إضافة ترجمات العروض
   - إضافة ترجمات العملة

3. ✅ `src/locales/en.json`
   - إضافة ترجمات العروض
   - إضافة ترجمات العملة

## Status

✅ **Fixed and Tested** - العروض تظهر الآن بشكل صحيح في الجدول

## Date

November 1, 2025
