"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { User } from "@/types/user";
import { UserTable } from "./UserTable";
import { DeleteConfirmModal } from "@/shared/components/modal/DeleteConfirmModal";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserBalanceDetail } from "./UserBalanceDetail";
import { Input } from "@nextui-org/react";
import { Search } from "lucide-react";

type ViewMode = "list" | "detail";

const UserManagement: React.FC = () => {
  const { t } = useTranslation();

  // use custom hook to manage user data
  const {
    users,
    fetchUsers,
    loading,
    pagination,
    handleDeleteUser,
    setPage,
    handleRechargeUser,
    setSearch,
  } = useUserManagement();

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null as User | null,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // 搜索相关状态
  const [searchValue, setSearchValue] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);


  const handleDeleteUserClick = useCallback((user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
    });
  }, []);

  const handleViewUserBalanceDetail = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setSelectedUserEmail(user.email);
    setViewMode('detail');
  }, []);

  const handleCloseUserBalanceDetail = useCallback(() => {
    setSelectedUserId(null);
    setSelectedUserEmail(null);
    setViewMode('list');
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteModal.user) {
      try {
        const success = await handleDeleteUser(deleteModal.user.id);

        if (success) {
          setDeleteModal({ isOpen: false, user: null });
        }
        // error handling is done in the hook
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  }, [deleteModal.user, handleDeleteUser]);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, user: null });
  }, []);

  const handleRecharge = useCallback(
    async (id: string, amount: number): Promise<boolean> => {
      return await handleRechargeUser(id, amount);
    },
    [handleRechargeUser]
  );

  // 处理搜索 - 使用防抖
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    
    // 清除之前的定时器
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后触发搜索
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  }, [setSearch]);

  if (viewMode === "detail" ) {
    return (
      <UserBalanceDetail
        userId={selectedUserId || ''}
        userEmail={selectedUserEmail || ''}
        onCancel={handleCloseUserBalanceDetail}
      />
    );
  }

  return (
    <DashboardDemoContent
      title={t("User")}
      description={t(
        "Manage registered users, view user information, and handle user operations"
      )}
    >
      <div className="space-y-6 w-full">
        {/* 搜索框 - 右上角 */}
        <div className="flex justify-end items-center gap-4">
          <Input
            isClearable
            className="w-full sm:max-w-[400px]"
            placeholder={t('Search by email')}
            startContent={<Search className="w-4 h-4" />}
            value={searchValue}
            onClear={() => {
              setSearchValue('');
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
              }
              setSearch('');
            }}
            onValueChange={handleSearchChange}
          />
        </div>

        <UserTable
          users={users}
          fetchUsers={fetchUsers}
          loading={loading}
          onDelete={handleDeleteUserClick}
          viewUserBalanceDetail={handleViewUserBalanceDetail}
          onRecharge={handleRecharge}
          pagination={pagination}
          onPageChange={setPage}
        />
      </div>

      <DeleteConfirmModal
        user={deleteModal.user}
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("Delete User")}
        description={t("Are you sure you want to delete this user? ")}
      />
    </DashboardDemoContent>
  );
};

export default UserManagement;
