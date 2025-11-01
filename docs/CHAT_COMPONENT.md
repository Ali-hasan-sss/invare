# Chat Component Documentation

## Overview

مكون المحادثة المباشرة للتواصل بين المشترين والبائعين في منصة إعادة التدوير.

## Features / المميزات

- ✅ تصميم جذاب وعصري مع دعم Dark Mode
- ✅ دعم كامل للغة العربية (RTL) والإنجليزية (LTR)
- ✅ إنشاء محادثة جديدة تلقائياً
- ✅ إرسال واستقبال الرسائل في الوقت الفعلي
- ✅ عرض الرسائل مع التوقيت
- ✅ تمييز رسائل المستخدم عن رسائل البائع
- ✅ Scroll تلقائي للرسائل الجديدة
- ✅ دعم Enter للإرسال السريع
- ✅ حالات التحميل والأخطاء

## Usage / الاستخدام

### في صفحة عرض المنتج (Listing Detail Page)

```tsx
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function ListingDetailPage() {
  const [showChat, setShowChat] = useState(false);
  const listing = {
    seller: {
      id: "seller-uuid",
      firstName: "أحمد",
      lastName: "السعيد",
    },
    title: "بلاستيك PET مجروش",
  };

  return (
    <div>
      {/* زر فتح المحادثة */}
      <Button onClick={() => setShowChat(true)}>
        <MessageCircle className="h-5 w-5 mr-2" />
        محادثة البائع
      </Button>

      {/* مكون المحادثة */}
      <ChatDialog
        open={showChat}
        onClose={() => setShowChat(false)}
        sellerUserId={listing.seller.id}
        sellerName={`${listing.seller.firstName} ${listing.seller.lastName}`}
        listingTitle={listing.title}
      />
    </div>
  );
}
```

## Props

| Prop           | Type         | Required | Description             |
| -------------- | ------------ | -------- | ----------------------- |
| `open`         | `boolean`    | ✅       | حالة فتح/إغلاق المحادثة |
| `onClose`      | `() => void` | ✅       | دالة إغلاق المحادثة     |
| `sellerUserId` | `string`     | ✅       | معرف البائع             |
| `sellerName`   | `string`     | ✅       | اسم البائع الكامل       |
| `listingTitle` | `string`     | ✅       | عنوان العرض             |

## Redux State Structure

```typescript
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

interface Chat {
  id: string;
  topic: string;
  createdByUserId: string;
  participantUserIds?: string[];
  status: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: string;
  senderUserId: string;
  content: string;
  createdAt?: string;
}
```

## API Endpoints Used

```typescript
POST /chat                    // إنشاء محادثة جديدة
GET  /chat/user/:userId      // جلب محادثات المستخدم
POST /chat/message           // إرسال رسالة
GET  /chat/:chatId/messages  // جلب رسائل المحادثة
PATCH /chat/:chatId/status   // تحديث حالة المحادثة
```

## Translations / الترجمات

### العربية (`ar.json`)

```json
{
  "chat": {
    "loading": "جاري التحميل...",
    "noMessages": "لا توجد رسائل بعد",
    "startConversation": "ابدأ المحادثة مع البائع",
    "typeMessage": "اكتب رسالتك...",
    "send": "إرسال",
    "chatWithSeller": "محادثة البائع",
    "messageSent": "تم إرسال الرسالة",
    "messageError": "فشل إرسال الرسالة"
  }
}
```

### English (`en.json`)

```json
{
  "chat": {
    "loading": "Loading...",
    "noMessages": "No messages yet",
    "startConversation": "Start conversation with seller",
    "typeMessage": "Type your message...",
    "send": "Send",
    "chatWithSeller": "Chat with Seller",
    "messageSent": "Message sent",
    "messageError": "Failed to send message"
  }
}
```

## Design Features / مميزات التصميم

### Header

- أيقونة دائرية زرقاء مع MessageCircle
- اسم البائع وعنوان العرض
- زر إغلاق أنيق

### Messages Area

- ارتفاع ثابت (384px) مع scroll
- رسائل المستخدم: خلفية زرقاء على اليمين (LTR) / اليسار (RTL)
- رسائل البائع: خلفية بيضاء/رمادية على اليسار (LTR) / اليمين (RTL)
- عرض التوقيت لكل رسالة
- Scroll تلقائي للأسفل

### Input Area

- حقل إدخال نصي واسع
- زر إرسال مع أيقونة
- دعم Enter للإرسال
- تعطيل عند التحميل

### States

- **Loading**: سبينر مع نص "جاري التحميل"
- **Empty**: أيقونة رسائل مع نص توجيهي
- **Active**: عرض الرسائل مع إمكانية الإرسال

## Custom Hook / useChat

```typescript
import { useChat } from "@/hooks/useChat";

const {
  chats, // جميع المحادثات
  currentChat, // المحادثة الحالية
  isLoading, // حالة التحميل
  error, // رسالة الخطأ
  createNewChat, // إنشاء محادثة
  sendMessage, // إرسال رسالة
  getMessages, // جلب الرسائل
  fetchUserChats, // جلب محادثات المستخدم
} = useChat();
```

## Styling

- يستخدم Tailwind CSS للتصميم
- يدعم Dark Mode بالكامل
- يستخدم Material-UI Dialog كـ container
- Responsive تماماً

## Notes / ملاحظات

1. يتطلب أن يكون المستخدم مسجل الدخول
2. ينشئ محادثة جديدة تلقائياً عند الفتح
3. يجلب الرسائل السابقة إن وجدت
4. يحفظ الرسائل في Redux state
5. يدعم RTL/LTR بشكل ديناميكي

## Example Integration

```tsx
// في صفحة تفاصيل العرض
const ListingDetailPage = ({ listing }) => {
  const [showChat, setShowChat] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleChatClick = () => {
    if (!isAuthenticated) {
      showToast("يجب تسجيل الدخول أولاً", "warning");
      router.push("/auth/login");
      return;
    }
    setShowChat(true);
  };

  return (
    <>
      <Button onClick={handleChatClick}>
        <MessageCircle /> محادثة البائع
      </Button>

      <ChatDialog
        open={showChat}
        onClose={() => setShowChat(false)}
        sellerUserId={listing.seller.id}
        sellerName={listing.seller.name}
        listingTitle={listing.title}
      />
    </>
  );
};
```
