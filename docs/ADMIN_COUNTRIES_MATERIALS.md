# Admin Countries and Materials Management

## Overview

This document describes the Countries and Hierarchical Materials management features in the admin panel.

## Features

### 1. Countries Management (`/admin/countries`)

#### Overview

Manage all countries available in the system with full CRUD operations.

#### Features

- **List Countries**: View all countries with their codes and names
- **Add Country**: Create new country with code (e.g., OM, SA, AE) and name
- **Edit Country**: Update existing country information
- **Delete Country**: Remove country from system
- **Search**: Filter countries by code or name

#### Components

- **CountryFormDialog**: Dialog for adding/editing countries
- **Countries Page**: Main management interface

#### API Integration

Uses `countriesSlice` with the following operations:

- `getCountries()`: Fetch all countries
- `createCountry(data)`: Create new country
- `updateCountry({ id, data })`: Update country
- `deleteCountry(id)`: Delete country

#### Country Data Structure

```typescript
interface Country {
  id: string;
  countryCode: string; // 2-letter code (OM, SA, etc.)
  countryName: string; // Full country name
}
```

---

### 2. Hierarchical Materials Management (`/admin/materials`)

#### Overview

A three-level hierarchical system for managing materials, categories, and listings.

#### Hierarchy Structure

```
Categories (Level 1)
  └─ Materials (Level 2)
      └─ Listings (Level 3)
```

#### Features

##### **Level 1: Categories**

- View all material categories
- Add new categories
- Edit category names
- Delete categories
- Search categories
- Navigate into category to view materials

##### **Level 2: Materials (within Category)**

- View all materials in selected category
- Add new materials with:
  - Material name
  - Unit of measure (kg, m, ton, etc.)
  - Auto-linked to parent category
- Edit material information
- Delete materials
- Search materials
- Navigate back to categories
- Navigate into material to view listings

##### **Level 3: Listings (within Material)**

- View all listings for selected material
- Display listing information:
  - Company name
  - Price and currency
  - Quantity with unit
  - Status (active, pending, expired)
- Search listings by company or price
- Navigate back to materials

#### Navigation Flow

```
Categories Page
    ↓ (Click "View Materials")
Materials Page (for selected category)
    ↓ (Click "View Listings")
Listings Page (for selected material)
```

#### Components

##### **CategoryFormDialog**

Dialog for adding/editing material categories.

- Field: Category name

##### **MaterialFormDialog**

Dialog for adding/editing materials within a category.

- Fields:
  - Material name
  - Unit of measure
  - Category ID (auto-set from parent)

##### **Materials Page**

Main hierarchical interface with three view modes:

- `categories`: Shows all categories
- `materials`: Shows materials in selected category
- `listings`: Shows listings for selected material

#### API Integration

**Categories:**

- `getMaterialCategories()`: Fetch all categories
- `createMaterialCategory(data)`: Create category
- `updateMaterialCategory({ id, data })`: Update category
- `deleteMaterialCategory(id)`: Delete category

**Materials:**

- `getMaterials({ categoryId })`: Fetch materials by category
- `createMaterial(data)`: Create material
- `updateMaterial({ id, data })`: Update material
- `deleteMaterial(id)`: Delete material

**Listings:**

- `getListings({ materialId })`: Fetch listings by material

#### Data Structures

```typescript
interface MaterialCategory {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  unitOfMeasure: string; // kg, m, ton, etc.
  categoryId?: string;
}

interface Listing {
  id: string;
  company?: {
    name: string;
  };
  price: number;
  currency: string;
  quantity: number;
  status: "active" | "pending" | "expired";
  materialId: string;
}
```

---

## Navigation

Both features are accessible from the admin sidebar:

```typescript
{
  name: "Countries",
  href: "/admin/countries",
  icon: Globe
}

{
  name: "Materials",
  href: "/admin/materials",
  icon: Package
}
```

---

## Translations

### Arabic (ar.json)

```json
{
  "admin": {
    "countries": "البلدان",
    "countriesManagement": "إدارة البلدان",
    "addCountry": "إضافة بلد",
    "editCountry": "تعديل بلد",
    "deleteCountry": "حذف بلد",
    "countryCode": "رمز البلد",
    "countryName": "اسم البلد",
    "materials": "المواد",
    "materialsManagement": "إدارة المواد",
    "categories": "الفئات",
    "categoryName": "اسم الفئة",
    "materialName": "اسم المادة",
    "unitOfMeasure": "وحدة القياس",
    "addCategory": "إضافة فئة",
    "editCategory": "تعديل فئة",
    "deleteCategory": "حذف فئة",
    "addMaterial": "إضافة مادة",
    "editMaterial": "تعديل مادة",
    "deleteMaterial": "حذف مادة",
    "viewMaterials": "عرض المواد",
    "viewListings": "عرض العروض",
    "backToCategories": "العودة للفئات",
    "backToMaterials": "العودة للمواد"
  }
}
```

### English (en.json)

```json
{
  "admin": {
    "countries": "Countries",
    "countriesManagement": "Countries Management",
    "addCountry": "Add Country",
    "editCountry": "Edit Country",
    "deleteCountry": "Delete Country",
    "countryCode": "Country Code",
    "countryName": "Country Name",
    "materials": "Materials",
    "materialsManagement": "Materials Management",
    "categories": "Categories",
    "categoryName": "Category Name",
    "materialName": "Material Name",
    "unitOfMeasure": "Unit of Measure",
    "addCategory": "Add Category",
    "editCategory": "Edit Category",
    "deleteCategory": "Delete Category",
    "addMaterial": "Add Material",
    "editMaterial": "Edit Material",
    "deleteMaterial": "Delete Material",
    "viewMaterials": "View Materials",
    "viewListings": "View Listings",
    "backToCategories": "Back to Categories",
    "backToMaterials": "Back to Materials"
  }
}
```

---

## Usage Examples

### Managing Countries

1. Navigate to `/admin/countries`
2. Click "Add Country" button
3. Enter country code (2 letters, e.g., OM)
4. Enter country name (e.g., Oman)
5. Click "Save"

### Managing Materials Hierarchy

#### Step 1: Create Category

1. Navigate to `/admin/materials`
2. Click "Add Category" button
3. Enter category name (e.g., "Building Materials")
4. Click "Save"

#### Step 2: Add Materials to Category

1. Click "View Materials" on a category
2. Click "Add Material" button
3. Enter material name (e.g., "Cement")
4. Enter unit of measure (e.g., "ton")
5. Click "Save"

#### Step 3: View Listings for Material

1. Click "View Listings" on a material
2. See all listings from companies for this material
3. Use "Back to Materials" to return
4. Use "Back to Categories" to return to top level

---

## State Management

### Countries State

```typescript
{
  countries: Country[];
  currentCountry: Country | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}
```

### Material Categories State

```typescript
{
  categories: MaterialCategory[];
  currentCategory: MaterialCategory | null;
  isLoading: boolean;
  error: string | null;
}
```

### Materials State

```typescript
{
  materials: Material[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}
```

---

## Best Practices

1. **Countries**: Use standard 2-letter ISO country codes (OM, SA, AE, etc.)
2. **Categories**: Use clear, descriptive names for categories
3. **Materials**: Always specify appropriate unit of measure
4. **Navigation**: Use breadcrumb-style navigation for easy return to previous levels
5. **Search**: Utilize search functionality to quickly find items in large lists
6. **Validation**: All forms include required field validation

---

## Error Handling

All operations include:

- Loading states during API calls
- Error messages via Toast notifications
- Success confirmations for CRUD operations
- Confirmation dialogs for delete operations

---

## Responsive Design

All pages are fully responsive:

- Mobile: Stacked layout with hamburger menu
- Tablet: Optimized spacing and button sizes
- Desktop: Full sidebar and table views

---

## Icons Used

- **Countries**: Globe (Lucide)
- **Materials/Categories**: Package, FolderOpen (Lucide)
- **Materials Items**: Box (Lucide)
- **Listings**: Tag (Lucide)
- **Actions**: Edit, Trash2, Plus, Search, ChevronRight, ArrowLeft (Lucide)

---

## Files Created/Modified

### New Files

1. `src/app/admin/countries/page.tsx` - Countries management page
2. `src/app/admin/materials/page.tsx` - Hierarchical materials management page
3. `src/components/admin/CountryFormDialog.tsx` - Country form dialog
4. `src/components/admin/CategoryFormDialog.tsx` - Category form dialog
5. `src/components/admin/MaterialFormDialog.tsx` - Material form dialog
6. `docs/ADMIN_COUNTRIES_MATERIALS.md` - This documentation

### Modified Files

1. `src/components/admin/AdminLayout.tsx` - Added Countries and Materials navigation
2. `src/locales/ar.json` - Added Arabic translations
3. `src/locales/en.json` - Added English translations

---

## Testing Checklist

### Countries

- [ ] Can view all countries
- [ ] Can add new country
- [ ] Can edit existing country
- [ ] Can delete country
- [ ] Search filters work correctly
- [ ] Validation works (required fields)
- [ ] Toast notifications appear
- [ ] Loading states display correctly

### Materials Hierarchy

- [ ] Can view all categories
- [ ] Can add/edit/delete categories
- [ ] Can navigate into category to view materials
- [ ] Can add/edit/delete materials within category
- [ ] Can navigate into material to view listings
- [ ] Can view all listings for material
- [ ] Back navigation works correctly
- [ ] Search works at each level
- [ ] Loading states display correctly
- [ ] Toast notifications appear

---

## Future Enhancements

### Countries

- Country flags display
- Region grouping
- Active/inactive status
- Country-specific settings

### Materials

- Bulk import/export
- Material images
- Category descriptions
- Material specifications
- Advanced filtering
- Sorting options
- Pagination for large datasets
- Direct listing management from materials page
