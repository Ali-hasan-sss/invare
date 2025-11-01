"use client";

import React, { useEffect, useState } from "react";
import { Users, Building2, ListOrdered, DollarSign } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useUsers } from "../../hooks/useUsers";
import { useCompanies } from "../../hooks/useCompanies";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/admin/StatCard";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const {
    users,
    getUsers,
    totalCount: usersCount,
    isLoading: usersLoading,
  } = useUsers();
  const {
    companies,
    getCompanies,
    totalCount: companiesCount,
    isLoading: companiesLoading,
  } = useCompanies();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([getUsers(), getCompanies()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: t("admin.totalUsers"),
      value: usersCount || users.length,
      icon: Users,
      color: "bg-blue-500",
      loading: usersLoading,
    },
    {
      title: t("admin.totalCompanies"),
      value: companiesCount || companies.length,
      icon: Building2,
      color: "bg-green-500",
      loading: companiesLoading,
    },
    {
      title: t("admin.activeListings"),
      value: "0",
      icon: ListOrdered,
      color: "bg-purple-500",
      loading: false,
    },
    {
      title: t("admin.totalRevenue"),
      value: "0",
      icon: DollarSign,
      color: "bg-yellow-500",
      loading: false,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.dashboard")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.title")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            loading={stat.loading}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manage Users
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add, edit, or remove users
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/companies"
              className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manage Companies
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add, edit, or verify companies
                  </p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Activity log and recent changes will be displayed here.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
