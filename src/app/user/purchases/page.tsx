"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Pagination,
} from "@mui/material";
import CardActionArea from "@mui/material/CardActionArea";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useTranslation } from "@/hooks/useTranslation";

const UserPurchasesPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    orders,
    isLoading,
    error,
    getOrders,
    currentPage,
    limit,
    setCurrentPage,
  } = useOrders();
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    getOrders({ page: currentPageLocal, limit: 20 });
  }, [getOrders, currentPageLocal]);

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((o: any) => {
      const createdById = o?.createdBy?.id || o?.createdByUserId;
      const buyerUserId = o?.buyerUser?.id;
      return createdById === user.id || buyerUserId === user.id;
    });
  }, [orders, user]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPageLocal(value);
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("user.myPurchases") || "مشترياتي" },
        ]}
      />

      <Typography
        variant="h4"
        component="h1"
        className="font-bold mb-4 text-gray-900 dark:text-gray-100"
      >
        {t("user.myPurchases") || "مشترياتي"}
      </Typography>

      {isLoading && orders.length === 0 ? (
        <Box className="flex items-center justify-center min-h-[300px]">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      ) : myOrders.length === 0 ? (
        <Box className="text-center py-12">
          <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
            {t("orders.noPurchases") || "لا توجد مشتريات"}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {myOrders.map((order) => (
              <Grid item xs={12} md={12} key={order.id}>
                <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardActionArea
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="!rounded-[inherit]"
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box className="flex items-center justify-between mb-2">
                            <Typography
                              variant="subtitle1"
                              className="font-semibold text-gray-900 dark:text-white"
                            >
                              {t("orders.order") || "طلب"} #
                              {order.id.slice(0, 8)}
                            </Typography>
                            <Chip
                              size="small"
                              label={(
                                order.orderStatus ||
                                (order as any).status ||
                                ""
                              ).toString()}
                              color={(() => {
                                const s =
                                  (order as any).orderStatus ||
                                  (order as any).status ||
                                  "";
                                const v = (s as string)
                                  .toString()
                                  .toLowerCase();
                                if (v.includes("pending"))
                                  return "warning" as any;
                                if (
                                  v.includes("completed") ||
                                  v.includes("paid") ||
                                  v.includes("success")
                                )
                                  return "success" as any;
                                if (
                                  v.includes("cancel") ||
                                  v.includes("failed")
                                )
                                  return "error" as any;
                                return "default" as any;
                              })()}
                              className="text-xs"
                            />
                          </Box>
                          <Divider className="my-2" />
                          <Box className="space-y-2 text-sm">
                            <Typography className="text-gray-600 dark:text-gray-400">
                              {t("orders.items") || "العناصر"}:{" "}
                              {order.items?.length || 0}
                            </Typography>
                            <Typography className="text-gray-600 dark:text-gray-400">
                              {t("orders.createdAt") || "تاريخ الإنشاء"}:{" "}
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                    "ar-SA"
                                  )
                                : "-"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box className="space-y-2 text-sm md:text-right">
                            {(order as any).items?.[0]?.listing && (
                              <Typography className="text-gray-700 dark:text-gray-300">
                                {t("listings.listing") || "العرض"}:{" "}
                                {((order as any).items[0] as any).listing.title}
                              </Typography>
                            )}
                            {(order as any).totalAmount && (
                              <Typography className="text-gray-900 dark:text-white font-semibold">
                                {t("orders.totalAmount") || "الإجمالي"}:{" "}
                                {(order as any).totalAmount}{" "}
                                {t("common.currency") || "ريال"}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {Math.ceil(myOrders.length / limit) > 1 && (
            <Box className="mt-8 flex justify-center">
              <Pagination
                count={Math.ceil(myOrders.length / limit)}
                page={currentPageLocal}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default UserPurchasesPage;
