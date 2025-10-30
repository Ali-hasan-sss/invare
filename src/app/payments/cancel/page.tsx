"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PaymentCancelPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnUrl = searchParams.get("returnUrl");
    const target = returnUrl || "/";
    const url = `${target}${
      target.includes("?") ? "&" : "?"
    }purchaseCancelled=1`;
    router.replace(url);
  }, [router, searchParams]);

  return null;
};

export default PaymentCancelPage;
