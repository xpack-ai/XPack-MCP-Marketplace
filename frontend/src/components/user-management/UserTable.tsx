"use client";

import React from 'react';
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
  Spinner
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { User } from '@/types/user';
import { Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onDelete: (user: User) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const { t } = useTranslation();

  // 只使用服务端分页
  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;

  // 直接显示传入的用户数据（已经是当前页的数据）
  const items = users;


  const handleDelete = React.useCallback((user: User) => {
    onDelete(user);
  }, [onDelete]);

  if (loading && users.length === 0) {
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
          <TableColumn>{t('Email')}</TableColumn>
          <TableColumn>{t('Register Date')}</TableColumn>
          <TableColumn>{t('Balance')}</TableColumn>
          <TableColumn>{t('Actions')}</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={t('No users found')}
        >
          {(user) => (
            <TableRow key={user.id}>
              <TableCell>
                <span className="text-sm">{user.email}</span>
              </TableCell>
              <TableCell>
                {user.created_at || '-'}
              </TableCell>
              <TableCell>
                {user.balance.toFixed(2) || "-"}
              </TableCell>

              <TableCell>
                <div className="relative flex items-center gap-2">

                  <Tooltip content={t('Delete User')} color="danger" closeDelay={0}>
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
    </div>
  );
};