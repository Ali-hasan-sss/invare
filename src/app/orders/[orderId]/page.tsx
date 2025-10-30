"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
} from "@mui/material";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useOrders } from "@/hooks/useOrders";
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentOrder, isLoading, error, getOrderById, clearError } =
    useOrders();

  useEffect(() => {
    if (orderId && typeof orderId === "string") {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  const statusColor = (status?: string) => {
    const v = (status || "").toString().toLowerCase();
    if (v.includes("pending")) return "warning" as any;
    if (v.includes("completed") || v.includes("paid") || v.includes("success"))
      return "success" as any;
    if (v.includes("cancel") || v.includes("failed")) return "error" as any;
    return "default" as any;
  };

  if (isLoading && !currentOrder) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box className="flex items-center justify-center min-h-[300px]">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !currentOrder) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          {t("common.back")}
        </Button>
      </Container>
    );
  }

  const order: any = currentOrder;

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          {
            label: t("user.myPurchases") || "مشترياتي",
            href: "/user/purchases",
          },
          {
            label: `${t("orders.order") || "طلب"} #${(order?.id || "").slice(
              0,
              8
            )}`,
          },
        ]}
      />

      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent>
          <Box className="flex items-center justify-between mb-4">
            <Typography
              variant="h5"
              className="font-bold text-gray-900 dark:text-white"
            >
              {t("orders.order") || "طلب"} #{(order?.id || "").slice(0, 8)}
            </Typography>
            <Chip
              size="small"
              label={(order?.orderStatus || order?.status || "").toString()}
              color={statusColor(order?.orderStatus || order?.status)}
              className="text-xs"
            />
          </Box>

          <Divider className="my-4" />

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Box className="space-y-2 text-sm">
              <Typography className="text-gray-600 dark:text-gray-400">
                {t("orders.createdAt") || "تاريخ الإنشاء"}:{" "}
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString("ar-SA")
                  : "-"}
              </Typography>
              {order?.buyerUser && (
                <Typography className="text-gray-600 dark:text-gray-400">
                  {t("auth.email") || "البريد الإلكتروني"}:{" "}
                  {order.buyerUser.email}
                </Typography>
              )}
              {order?.sellerCompany && (
                <Typography className="text-gray-600 dark:text-gray-400">
                  {t("listings.seller") || "البائع"}:{" "}
                  {order.sellerCompany.companyName}
                </Typography>
              )}
            </Box>

            <Box className="space-y-2 text-sm md:text-right">
              {order?.totalAmount && (
                <Typography className="text-gray-900 dark:text-white font-semibold">
                  {t("orders.totalAmount") || "الإجمالي"}: {order.totalAmount}{" "}
                  {t("common.currency") || "ريال"}
                </Typography>
              )}
              <Typography className="text-gray-600 dark:text-gray-400">
                {t("orders.items") || "العناصر"}: {order?.items?.length || 0}
              </Typography>
            </Box>
          </Box>

          <Divider className="my-4" />

          <Typography
            variant="h6"
            className="font-semibold mb-2 text-gray-900 dark:text-white"
          >
            {t("orders.items") || "العناصر"}
          </Typography>
          <TableContainer className="dark:bg-gray-800">
            <Table>
              <TableBody>
                {(order?.items || []).map((item: any) => (
                  <TableRow key={item.id} className="dark:border-gray-700">
                    <TableCell className="text-gray-900 dark:text-white w-1/2 border-gray-200 dark:border-gray-700">
                      {item.listing?.title || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                      {t("payments.quantity") || "الكمية"}: {item.quantity}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                      {t("payments.pricePerUnit") || "السعر للوحدة"}:{" "}
                      {item.unitPrice} {t("common.currency") || "ريال"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="mt-6">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              {t("common.back")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderDetailPage;
