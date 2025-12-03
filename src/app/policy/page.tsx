"use client";

import React from "react";
import { Container, Box, Typography, Paper, Divider } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Shield } from "lucide-react";

const PolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: "Privacy Policy" },
        ]}
      />

      <Paper className="p-6 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
        <Box className="flex items-center mb-4">
          <Shield
            size={24}
            className="text-purple-600 dark:text-purple-400 ltr:mr-3 rtl:ml-3"
          />
          <Typography
            variant="h4"
            className="font-bold text-gray-900 dark:text-gray-100"
          >
            Privacy Policy
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
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At Invare ("we," "our," or "us"), we are committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our online
              auction platform for recycled materials.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              1. Information We Collect
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              We collect information that you provide directly to us, including:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>
                <strong>Account Information:</strong> Name, email address, phone
                number, and password when you create an account
              </li>
              <li>
                <strong>Profile Information:</strong> Company details, address,
                and other information you choose to provide
              </li>
              <li>
                <strong>Transaction Information:</strong> Payment details,
                bidding history, and purchase records
              </li>
              <li>
                <strong>Listing Information:</strong> Materials you list,
                descriptions, images, and pricing information
              </li>
              <li>
                <strong>Communication:</strong> Messages sent through the
                Platform and correspondence with our support team
              </li>
            </ul>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              We also automatically collect certain information when you use the
              Platform, including:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>
                Device information (IP address, browser type, operating system)
              </li>
              <li>
                Usage data (pages visited, time spent, clicks, and interactions)
              </li>
              <li>Location data (if you enable location services)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              2. How We Use Your Information
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              We use the information we collect to:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>Provide, maintain, and improve the Platform</li>
              <li>Process transactions and facilitate auctions</li>
              <li>Create and manage your account</li>
              <li>
                Communicate with you about your account, transactions, and
                Platform updates
              </li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
              <li>Personalize your experience on the Platform</li>
              <li>Analyze usage patterns and improve our services</li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              3. Information Sharing and Disclosure
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              We may share your information in the following circumstances:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>
                <strong>With Other Users:</strong> Your public profile
                information and listings are visible to other users
              </li>
              <li>
                <strong>Service Providers:</strong> We share information with
                third-party service providers who perform services on our behalf
                (payment processing, hosting, analytics)
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information
                if required by law or to protect our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> Information may be
                transferred in connection with a merger, acquisition, or sale of
                assets
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share information for
                other purposes with your explicit consent
              </li>
            </ul>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              4. Data Security
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet or electronic storage is 100%
              secure. While we strive to protect your information, we cannot
              guarantee absolute security.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              5. Cookies and Tracking Technologies
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to collect and
              store information about your preferences and activity on the
              Platform. You can control cookies through your browser settings,
              but disabling cookies may limit your ability to use certain
              features of the Platform.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              6. Your Rights and Choices
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
              You have the right to:
            </Typography>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ltr:ml-6 rtl:mr-6">
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              To exercise these rights, please contact us at{" "}
              <a
                href="mailto:support@invare.sa"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                support@invare.sa
              </a>
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              7. Data Retention
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law. When we
              no longer need your information, we will securely delete or
              anonymize it.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              8. Children's Privacy
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Platform is not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you believe we have collected information from a child, please
              contact us immediately.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              9. International Data Transfers
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              data protection laws that differ from those in your country. By
              using the Platform, you consent to the transfer of your
              information to these countries.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              10. Third-Party Links
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The Platform may contain links to third-party websites or
              services. We are not responsible for the privacy practices of
              these third parties. We encourage you to review their privacy
              policies before providing any information.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              11. Changes to This Privacy Policy
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. You are advised to
              review this Privacy Policy periodically for any changes.
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              12. Contact Us
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at:{" "}
              <a
                href="mailto:support@invare.sa"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                support@invare.sa
              </a>
            </Typography>
          </section>

          <section>
            <Typography
              variant="h5"
              className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
            >
              13. Governing Law
            </Typography>
            <Typography className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This Privacy Policy is governed by the laws of the Kingdom of
              Saudi Arabia. Any disputes arising from this Privacy Policy shall
              be subject to the exclusive jurisdiction of the courts of Saudi
              Arabia.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
};

export default PolicyPage;
