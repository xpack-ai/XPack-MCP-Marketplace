"use client";

import React, { useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Spinner
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';

export interface WalletRecord {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletTableProps {
  records: WalletRecord[];
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export const WalletTable: React.FC<WalletTableProps> = ({
  records,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);

  const pages = Math.ceil(records.length / ITEMS_PER_PAGE);

  const items = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return records.slice(start, end);
  }, [page, records]);

  const getStatusColor = (status: WalletRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: WalletRecord['status']) => {
    switch (status) {
      case 'completed':
        return t('Completed');
      case 'pending':
        return t('Pending');
      case 'failed':
        return t('Failed');
      default:
        return status;
    }
  };

  const formatAmount = (amount: number) => {
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="w-3 h-3 text-green-600" />
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(amount)}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return (
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3 text-gray-500" />
        <span className="text-sm text-gray-600">
          {new Date(dateString).toLocaleString()}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table
        aria-label="Wallet recharge history table"
        removeWrapper
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                showControls
                variant='light'
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>{t("Date")}</TableColumn>
          <TableColumn>{t("Status")}</TableColumn>
          <TableColumn>{t("Amount")}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t("No recharge history found")}>
          {items.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {formatDate(record.date)}
              </TableCell>
              <TableCell>
                <Chip
                  color={getStatusColor(record.status)}
                  size="sm"
                  variant="flat"
                >
                  {getStatusText(record.status)}
                </Chip>
              </TableCell>
              <TableCell>
                {formatAmount(record.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};