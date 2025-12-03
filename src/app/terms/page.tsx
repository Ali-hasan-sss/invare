"use client";

import React from "react";
import { Container, Box, Typography, Paper, Divider } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FileText } from "lucide-react";

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: "Terms of Service" },
        ]}
      />

      <Paper className="p-6 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
        <Box className="flex items-center mb-4">
          <FileText
            size={24}
            className="text-purple-600 dark:text-purple-400 ltr:mr-3 rtl:ml-3"
          />
          <Typography
            variant="h4"
            className="font-bold text-gray-900 dark:text-gray-100"
          >
            Terms of Service
          </Typography>
        </Box>
        <Typography className="mb-6 text-gray-700 dark:text-gray-300">
          Last Updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>

        <Divider className="my-6" />

        <Box className="space-y-6">
          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              1. Acceptance of Terms
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing and using Invare ("the Platform"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              2. Description of Service
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Invare is an online auction platform specializing in recycled
              materials. We provide a marketplace where users can list, bid on,
              and purchase recycled materials through live auctions and direct
              sales.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              3. User Accounts
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              To use certain features of the Platform, you must register for an
              account. You agree to:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>
                Provide accurate, current, and complete information during
                registration
              </li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>
                Accept all responsibility for activities that occur under your
                account
              </li>
              <li>
                Notify us immediately of any unauthorized use of your account
              </li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              4. Auction and Bidding
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              When participating in auctions, you agree to:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>Place bids only if you intend to complete the purchase</li>
              <li>Honor all winning bids and complete transactions</li>
              <li>Not engage in bid manipulation or fraudulent activities</li>
              <li>Comply with all auction rules and time limits</li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              5. Payment Terms
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All payments must be made through our designated payment gateway.
              Prices are displayed in the currency specified on the Platform.
              You are responsible for all applicable taxes and fees. Payment
              must be completed within the timeframe specified for each
              transaction.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              6. Listing Materials
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              If you list materials on the Platform, you agree to:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>Provide accurate descriptions and images of materials</li>
              <li>Disclose any defects or issues with the materials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not list prohibited or illegal materials</li>
              <li>Fulfill orders as described in your listings</li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              7. Prohibited Activities
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              You may not:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>Use the Platform for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit viruses or malicious code</li>
              <li>Interfere with the Platform's operation</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Engage in fraudulent or deceptive practices</li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              8. Intellectual Property
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All content on the Platform, including text, graphics, logos,
              images, and software, is the property of Invare or its content
              suppliers and is protected by copyright and other intellectual
              property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              9. Limitation of Liability
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Invare provides the Platform "as is" without warranties of any
              kind. We are not liable for any damages arising from your use of
              the Platform, including but not limited to direct, indirect,
              incidental, or consequential damages. We do not guarantee the
              accuracy, completeness, or reliability of any content or materials
              listed on the Platform.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              10. Dispute Resolution
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Any disputes arising from these Terms or your use of the Platform
              shall be resolved through good faith negotiation. If a resolution
              cannot be reached, disputes shall be subject to the exclusive
              jurisdiction of the courts of Saudi Arabia.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              11. Modifications to Terms
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes
              will be effective immediately upon posting. Your continued use of
              the Platform after changes are posted constitutes acceptance of
              the modified Terms.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              12. Termination
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to terminate or suspend your account and
              access to the Platform at any time, without prior notice, for any
              reason, including violation of these Terms.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              13. Contact Information
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:{" "}
              <a
                href="mailto:support@invare.sa"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                support@invare.sa
              </a>
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsPage;
