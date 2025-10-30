"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { PaymentMethod, PAYMENT_METHOD_LABELS } from "@/config/thawani";

export interface PaymentFlowDialogsProps {
  // Selection dialog
  isPaymentMethodDialogOpen: boolean;
  onClosePaymentMethodDialog: () => void;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (m: PaymentMethod) => void;
  purchaseQuantity: number;
  handleQuantityChange: (value: number) => void;
  selectedListingUnitOfMeasure: string | null;
  selectedListingPrice: string | null;
  selectedListingStockAmount: number | null;
  calculatedTotalAmount: string;
  onProceedToPayment: () => void;
  // Processing dialog
  isPaymentDialogOpen: boolean;
  onClosePaymentDialog: () => void;
  selectedListingAmount: string | null;
}

const PaymentFlowDialogs: React.FC<PaymentFlowDialogsProps> = (props) => {
  const { t } = useTranslation();
  const {
    isPaymentMethodDialogOpen,
    onClosePaymentMethodDialog,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    purchaseQuantity,
    handleQuantityChange,
    selectedListingUnitOfMeasure,
    selectedListingPrice,
    selectedListingStockAmount,
    calculatedTotalAmount,
    onProceedToPayment,
    isPaymentDialogOpen,
    onClosePaymentDialog,
    selectedListingAmount,
  } = props;

  return (
    <>
      <Dialog
        open={isPaymentMethodDialogOpen}
        onClose={onClosePaymentMethodDialog}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        PaperProps={{ className: "dark:bg-gray-800 dark:text-white" }}
      >
        <DialogTitle className="dark:bg-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
          <Typography
            component="span"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {t("payments.selectPaymentMethod") || "اختر طريقة الدفع"}
          </Typography>
        </DialogTitle>
        <DialogContent className="pt-6 dark:bg-gray-800">
          <Box className="space-y-4">
            {selectedListingPrice && selectedListingUnitOfMeasure && (
              <Box className="space-y-2">
                <Typography
                  variant="body2"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  {t("payments.quantity") || "الكمية"}
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={purchaseQuantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    handleQuantityChange(value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography className="text-gray-500 dark:text-gray-400">
                          {selectedListingUnitOfMeasure}
                        </Typography>
                      </InputAdornment>
                    ),
                    className: "dark:text-white",
                  }}
                  inputProps={{
                    min: 1,
                    max: selectedListingStockAmount || undefined,
                    step: 1,
                  }}
                  helperText={
                    selectedListingStockAmount
                      ? `${
                          t("payments.availableStock") || "المتاح"
                        }: ${selectedListingStockAmount} ${selectedListingUnitOfMeasure}`
                      : undefined
                  }
                  error={
                    selectedListingStockAmount
                      ? purchaseQuantity > selectedListingStockAmount
                      : false
                  }
                />
              </Box>
            )}

            {selectedListingPrice && selectedListingUnitOfMeasure && (
              <Box className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Typography
                  variant="body2"
                  className="text-gray-600 dark:text-gray-400"
                >
                  {t("payments.pricePerUnit") || "السعر للوحدة"}
                </Typography>
                <Typography
                  variant="body1"
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {selectedListingPrice} {t("common.currency") || "ريال"} /{" "}
                  {selectedListingUnitOfMeasure}
                </Typography>
              </Box>
            )}

            {calculatedTotalAmount && parseFloat(calculatedTotalAmount) > 0 && (
              <Box className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <Typography
                  variant="body2"
                  className="text-gray-600 dark:text-gray-400 mb-1"
                >
                  {t("payments.totalAmount") || "المبلغ الإجمالي"}
                </Typography>
                <Typography
                  variant="h5"
                  className="text-green-600 dark:text-green-400 font-bold"
                >
                  {parseFloat(calculatedTotalAmount).toLocaleString("ar-SA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {t("common.currency") || "ريال"}
                </Typography>
              </Box>
            )}

            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(e) =>
                setSelectedPaymentMethod(e.target.value as PaymentMethod)
              }
              className="space-y-3"
            >
              <FormControlLabel
                value={PaymentMethod.THAWANI}
                control={<Radio className="dark:text-gray-300" />}
                label={
                  <Box className="flex items-center gap-2">
                    <Typography className="font-medium text-gray-900 dark:text-white">
                      {PAYMENT_METHOD_LABELS[PaymentMethod.THAWANI]}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-gray-500 dark:text-gray-400"
                    >
                      ({t("payments.securePayment") || "دفع آمن"})
                    </Typography>
                  </Box>
                }
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              />
            </RadioGroup>
          </Box>
        </DialogContent>
        <DialogActions className="p-4 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClosePaymentMethodDialog}
            className="text-gray-600 dark:text-gray-400"
          >
            {t("common.cancel") || "إلغاء"}
          </Button>
          <Button
            variant="contained"
            onClick={onProceedToPayment}
            disabled={
              purchaseQuantity <= 0 ||
              (selectedListingStockAmount !== null &&
                purchaseQuantity > selectedListingStockAmount) ||
              parseFloat(calculatedTotalAmount || "0") <= 0
            }
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
          >
            {t("payments.proceedToPayment") || "المتابعة للدفع"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPaymentDialogOpen}
        onClose={onClosePaymentDialog}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        PaperProps={{ className: "dark:bg-gray-800 dark:text-white" }}
      >
        <DialogTitle className="dark:bg-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
          <Typography
            component="span"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {t("payments.processingPayment") || "معالجة الدفع"}
          </Typography>
        </DialogTitle>
        <DialogContent className="pt-6 dark:bg-gray-800">
          <Box className="flex flex-col items-center justify-center py-8 space-y-4">
            <CircularProgress size={60} className="text-purple-600" />
            <Typography
              variant="body1"
              className="text-gray-700 dark:text-gray-300 text-center"
            >
              {t("payments.redirectingToPayment") ||
                "جاري إعادة التوجيه إلى صفحة الدفع..."}
            </Typography>
            {selectedListingAmount && (
              <Box className="text-center space-y-2">
                {purchaseQuantity > 0 && selectedListingUnitOfMeasure && (
                  <Typography
                    variant="body2"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    {t("payments.quantity") || "الكمية"}: {purchaseQuantity}{" "}
                    {selectedListingUnitOfMeasure}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  className="text-gray-500 dark:text-gray-400"
                >
                  {t("payments.amount") || "المبلغ"}:{" "}
                  {parseFloat(selectedListingAmount).toLocaleString("ar-SA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {t("common.currency") || "ريال"}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentFlowDialogs;
