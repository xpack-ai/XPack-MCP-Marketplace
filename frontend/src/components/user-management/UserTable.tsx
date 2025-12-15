"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Tooltip,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { User } from "@/types/user";
import { Trash2, CreditCard } from "lucide-react";
import { AdminRechargeModal } from "@/components/user-management/AdminRechargeModal";
import { fetchSimpleResourceGroups, updateUserResourceGroup } from "@/api/resourceGroup.api";
import toast from "react-hot-toast";

interface UserTableProps {
  users: User[];
  fetchUsers: () => void;
  loading?: boolean;
  onDelete: (user: User) => void;
  onRecharge: (id: string, amount: number) => Promise<boolean>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  fetchUsers,
  loading = false,
  onDelete,
  onRecharge,
  pagination,
  onPageChange,
}) => {
  const { t } = useTranslation();

  // 只使用服务端分页
  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;

  // 直接显示传入的用户数据（已经是当前页的数据）
  const items = users;

  const [isRechargeModalOpen, setIsRechargeModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const [simpleResourceGroups, setSimpleResourceGroups] = useState<{ id: string, name: string }[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const handleDelete = React.useCallback(
    (user: User) => {
      onDelete(user);
    },
    [onDelete]
  );

  const handleRecharge = React.useCallback((user: User) => {
    setSelectedUser(user);
    setIsRechargeModalOpen(true);
  }, []);

  const handleRechargeClose = React.useCallback(() => {
    setIsRechargeModalOpen(false);
    setSelectedUser(null);
  }, []);

  // 加载简易资源组列表
  const loadSimpleResourceGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const data = await fetchSimpleResourceGroups();
      setSimpleResourceGroups(data);
    } catch (error) {
      console.error("Failed to load simple resource groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const changeResourceGroup = async (user: User, resourceGroupId: string) => {
    const success = await updateUserResourceGroup(user.id, resourceGroupId);
    if (success) {
      toast.success(t("Resource group updated successfully"));
      fetchUsers();
    }
  }
  
  // 初始加载简易资源组列表
  useEffect(() => {
    loadSimpleResourceGroups();
  }, [loadSimpleResourceGroups]);
  
  // 等待用户数据或资源组数据加载
  if ((loading && users.length === 0) || groupsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table
        aria-label="Users table"
        classNames={{
          wrapper: "min-h-[400px]",
        }}
        removeWrapper
      >
        <TableHeader>
          <TableColumn>{t("Email")}</TableColumn>
          <TableColumn>{t("Resource Group")}</TableColumn>
          <TableColumn>{t("Register Date")}</TableColumn>
          <TableColumn>{t("Balance")}</TableColumn>
          <TableColumn>{t("Actions")}</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={t("No users found")}
        >
          {(user) => (
            <TableRow key={user.id}>
              <TableCell>
                <span className="text-sm">{user.email}</span>
              </TableCell>
              <TableCell>
                <Select
                  items={simpleResourceGroups}
                  placeholder={t("Select resource group")}
                  selectedKeys={user.resource_group ? [user.resource_group] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    if (selectedKey) {
                      changeResourceGroup(user, selectedKey);
                    }
                  }}
                  size="sm"
                  className="min-w-[200px]"
                  aria-label={t("Select resource group")}
                >
                  {(group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  )}
                </Select>
              </TableCell>
              <TableCell>{user.created_at || "-"}</TableCell>
              <TableCell>{user.balance.toFixed(2) || "-"}</TableCell>

              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip
                    content={t("Recharge User")}
                    color="primary"
                    closeDelay={0}
                    disableAnimation
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => handleRecharge(user)}
                    >
                      <CreditCard className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip
                    content={t("Delete User")}
                    color="danger"
                    closeDelay={0}
                    disableAnimation
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pages > 1 && (
        <div className="flex w-full justify-center">
          <Pagination
            showControls
            color="primary"
            variant="light"
            page={currentPage}
            total={pages}
            onChange={onPageChange}
          />
        </div>
      )}

      {/* Admin Recharge Modal */}
      <AdminRechargeModal
        isOpen={isRechargeModalOpen}
        onClose={handleRechargeClose}
        user={selectedUser}
        onRecharge={onRecharge}
      />
    </div>
  );
};
