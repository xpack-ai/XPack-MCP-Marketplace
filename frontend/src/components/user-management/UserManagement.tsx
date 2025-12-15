"use client";

import React, { useState, useCallback } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { User } from "@/types/user";
import { UserTable } from "./UserTable";
import { DeleteConfirmModal } from "@/shared/components/modal/DeleteConfirmModal";
import DashboardDemoContent from "@/shared/components/DashboardDemoContent";
import { useUserManagement } from "@/hooks/useUserManagement";

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
  } = useUserManagement();

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null as User | null,
  });

  const handleDeleteUserClick = useCallback((user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
    });
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

  return (
    <DashboardDemoContent
      title={t("User")}
      description={t(
        "Manage registered users, view user information, and handle user operations"
      )}
    >
      <div className="space-y-6 w-full">
        <UserTable
          users={users}
          fetchUsers={fetchUsers}
          loading={loading}
          onDelete={handleDeleteUserClick}
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
