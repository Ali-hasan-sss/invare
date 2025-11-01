# نظام رفع الملفات - File Upload System

## 📚 المحتويات

1. [المكونات المتاحة](#المكونات-المتاحة)
2. [الاستخدام الأساسي](#الاستخدام-الأساسي)
3. [الخدمات (Services)](#الخدمات-services)
4. [الأمثلة](#الأمثلة)

---

## 🧩 المكونات المتاحة

### 1. `FileUpload`
مكون عام لرفع الملفات والصور

### 2. `ImageUpload`
مكون مبسط مخصص للصور فقط

### 3. `uploadService`
خدمة لرفع الملفات عبر API

---

## 🚀 الاستخدام الأساسي

### رفع الصور (Image Upload)

```tsx
import { ImageUpload } from "@/components/ui/ImageUpload";

function MyForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <ImageUpload
      value={imageUrl}
      onChange={(url) => setImageUrl(url)}
      onRemove={() => setImageUrl("")}
    />
  );
}
```

### رفع الملفات العادية (File Upload)

```tsx
import { FileUpload } from "@/components/ui/FileUpload";

function MyForm() {
  const [fileUrl, setFileUrl] = useState("");

  return (
    <FileUpload
      type="file"
      value={fileUrl}
      onChange={(url) => setFileUrl(url)}
      onRemove={() => setFileUrl("")}
      accept=".pdf,.doc,.docx"
      maxSize={20}
    />
  );
}
```

---

## 🎛️ Props

### FileUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"image" \| "file"` | `"image"` | نوع الرفع |
| `value` | `string` | - | رابط الملف الحالي |
| `onChange` | `(url: string) => void` | - | يتم استدعاؤها عند الرفع الناجح |
| `onRemove` | `() => void` | - | يتم استدعاؤها عند حذف الملف |
| `className` | `string` | - | CSS classes إضافية |
| `disabled` | `boolean` | `false` | تعطيل المكون |
| `accept` | `string` | `"image/*"` أو `"*/*"` | أنواع الملفات المقبولة |
| `maxSize` | `number` | `10` للصور، `20` للملفات | الحد الأقصى بالميجابايت |

### ImageUpload Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | رابط الصورة الحالية |
| `onChange` | `(url: string) => void` | يتم استدعاؤها عند الرفع الناجح |
| `onRemove` | `() => void` | يتم استدعاؤها عند حذف الصورة |
| `className` | `string` | CSS classes إضافية |
| `disabled` | `boolean` | تعطيل المكون |

---

## 🛠️ الخدمات (Services)

### uploadImage(file, onProgress?)

رفع صورة

```typescript
import { uploadImage } from "@/services/uploadService";

const handleUpload = async (file: File) => {
  try {
    const url = await uploadImage(file, (progress) => {
      console.log(`${progress.percentage}%`);
    });
    console.log("Uploaded:", url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### uploadFile(file, onProgress?)

رفع ملف عادي

```typescript
import { uploadFile } from "@/services/uploadService";

const handleUpload = async (file: File) => {
  try {
    const url = await uploadFile(file, (progress) => {
      console.log(`${progress.percentage}%`);
    });
    console.log("Uploaded:", url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### formatFileSize(bytes)

تنسيق حجم الملف

```typescript
import { formatFileSize } from "@/services/uploadService";

console.log(formatFileSize(1024)); // "1 KB"
console.log(formatFileSize(1048576)); // "1 MB"
```

---

## 📋 الأمثلة

### مثال 1: فورم إضافة إعلان

```tsx
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";

function AdvertisementForm() {
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
  });

  return (
    <form>
      <div>
        <label>صورة الإعلان</label>
        <ImageUpload
          value={formData.imageUrl}
          onChange={(url) =>
            setFormData((prev) => ({ ...prev, imageUrl: url }))
          }
        />
        {/* أو يمكن إدخال الرابط يدوياً */}
        <Input
          type="url"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
          }
          placeholder="أو أدخل رابط الصورة"
        />
      </div>

      <div>
        <label>العنوان</label>
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>
    </form>
  );
}
```

### مثال 2: رفع مستندات PDF

```tsx
import { FileUpload } from "@/components/ui/FileUpload";

function DocumentUpload() {
  const [documentUrl, setDocumentUrl] = useState("");

  return (
    <FileUpload
      type="file"
      value={documentUrl}
      onChange={setDocumentUrl}
      accept=".pdf"
      maxSize={20}
    />
  );
}
```

### مثال 3: معرض صور متعدد

```tsx
import { ImageUpload } from "@/components/ui/ImageUpload";

function GalleryUpload() {
  const [images, setImages] = useState<string[]>([]);

  const handleAddImage = (url: string) => {
    setImages((prev) => [...prev, url]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((url, index) => (
        <ImageUpload
          key={index}
          value={url}
          onChange={(newUrl) => {
            const newImages = [...images];
            newImages[index] = newUrl;
            setImages(newImages);
          }}
          onRemove={() => handleRemoveImage(index)}
        />
      ))}
      <ImageUpload
        value=""
        onChange={handleAddImage}
      />
    </div>
  );
}
```

---

## ✨ المميزات

- ✅ **Drag & Drop** - سحب وإفلات الملفات
- ✅ **معاينة الصور** - عرض الصورة المرفوعة
- ✅ **شريط التقدم** - عرض نسبة الرفع
- ✅ **التحقق من النوع والحجم** - تحقق تلقائي
- ✅ **معالجة الأخطاء** - رسائل خطأ واضحة
- ✅ **دعم RTL/LTR** - يعمل بكلا الاتجاهين
- ✅ **Dark Mode** - دعم الوضع الداكن
- ✅ **Bearer Token** - مصادقة تلقائية

---

## 🔒 الأمان

- يتم إرسال Bearer Token تلقائياً من `apiClient`
- التحقق من نوع الملف على مستوى الـ Frontend
- التحقق من حجم الملف قبل الرفع
- حد أقصى 10 MB للصور
- حد أقصى 20 MB للملفات العادية

---

## 🌐 API Endpoints

```
POST /uploads/image - رفع صورة
POST /uploads/file  - رفع ملف

Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Response:
{
  "url": "https://host/public/images/filename.jpg"
}
```

---

## 📝 الترجمات

جميع النصوص مترجمة في:
- `src/locales/ar.json`
- `src/locales/en.json`

تحت مفتاح `upload.*`

---

## 🐛 استكشاف الأخطاء

### الملف لا يرفع
- تأكد من تسجيل الدخول (Bearer Token)
- تحقق من نوع الملف
- تحقق من حجم الملف

### الصورة لا تظهر
- تأكد من صلاحية الرابط المُرجع
- تحقق من CORS settings
- افحص console للأخطاء

---

## 📦 الملفات المرتبطة

- `src/components/ui/FileUpload.tsx`
- `src/components/ui/ImageUpload.tsx`
- `src/services/uploadService.ts`
- `src/config/api.ts`
- `src/locales/ar.json`
- `src/locales/en.json`

