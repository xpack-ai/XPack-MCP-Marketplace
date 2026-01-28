"use client";

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Spinner,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PaymentState, RevenueRecord } from '@/types/revenue';
import { Calendar, CreditCard, HelpCircle, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/currency';

interface RevenueTableProps {
  records: RevenueRecord[];
  loading?: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPaymentTypeChange?: (paymentType: string) => void;
  onSortChange?: (field: string | undefined, order: 'asc' | 'desc' | undefined) => void;
}

export const RevenueTable: React.FC<RevenueTableProps> = ({
  records,
  loading = false,
  pagination,
  onPageChange,
  onPaymentTypeChange,
  onSortChange,
}) => {
  const { t } = useTranslation();
  const [selectedPaymentType, setSelectedPaymentType] = useState('all');
  const [sortState, setSortState] = useState<'none' | 'desc' | 'asc'>('none');

  const pages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;

  // directly show the records data (already the data of current page)
  const items = records;

  const getStatusColor = (status: RevenueRecord['payment_state']) => {
    switch (status) {
      case PaymentState.Completed:
        return 'success';
      case PaymentState.Pending:
        return 'warning';
      case PaymentState.Failed:
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: RevenueRecord['payment_state']) => {
    switch (status) {
      case PaymentState.Completed:
        return t('Completed');
      case PaymentState.Pending:
        return t('Pending');
      case PaymentState.Failed:
        return t('Failed');
      default:
        return status;
    }
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

  const formatPaymentMethod = (method?: string) => {
    if (!method) return '-';
    return (
      <div className="flex items-center gap-1">
        <CreditCard className="w-3 h-3 text-blue-500" />
        <span className="text-sm text-gray-600">
          {method}
        </span>
      </div>
    );
  };

  // 处理付款方式筛选
  const handlePaymentTypeChange = (type: string) => {
    setSelectedPaymentType(type);
    onPaymentTypeChange?.(type);
  };

  // 处理排序
  const handleSortClick = () => {
    let newSortState: 'none' | 'desc' | 'asc';
    if (sortState === 'none') {
      newSortState = 'desc';
      onSortChange?.('amount', 'desc');
    } else if (sortState === 'desc') {
      newSortState = 'asc';
      onSortChange?.('amount', 'asc');
    } else {
      newSortState = 'none';
      onSortChange?.(undefined, undefined);
    }
    setSortState(newSortState);
  };

  // 获取排序图标
  const getSortIcon = () => {
    if (sortState === 'desc') return <ArrowDown className="w-4 h-4" />;
    if (sortState === 'asc') return <ArrowUp className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
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
        aria-label="Revenue records table"
        removeWrapper
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                showControls
                variant='light'
                color="primary"
                page={currentPage}
                total={pages}
                onChange={onPageChange}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn>{t('Account (Email)')}</TableColumn>
          <TableColumn>
            <div className="flex items-center gap-2">
              <span>{t('Recharge Amount')}</span>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleSortClick}
                className="min-w-unit-6 w-6 h-6"
              >
                {getSortIcon()}
              </Button>
            </div>
          </TableColumn>
          <TableColumn>
            <div className="flex items-center gap-1">
              <span>{t('Recharge Time')}</span>
              <Tooltip
                content={t("Current display time is UTC time")}
                color="default"
                closeDelay={0}
                disableAnimation
              >
                <HelpCircle className="w-4 h-4" />
              </Tooltip>
            </div>
          </TableColumn>
          <TableColumn>
            <div className="flex items-center gap-2">
              <span>{t('Payment Method')}</span>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Filter by payment method"
                    className="min-w-unit-6 w-6 h-6"
                  >
                    <Filter
                      className={`w-4 h-4 ${
                        selectedPaymentType !== 'all' ? 'text-primary' : ''
                      }`}
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Payment method filter"
                  selectionMode="single"
                  selectedKeys={[selectedPaymentType]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handlePaymentTypeChange(selected);
                  }}
                >
                  <DropdownItem key="all">{t('All')}</DropdownItem>
                  <DropdownItem key="stripe">Stripe</DropdownItem>
                  <DropdownItem key="platform">Platform</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </TableColumn>
          <TableColumn>{t('Transaction ID')}</TableColumn>
          <TableColumn>{t('Status')}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t('No revenue records found')}>
          {items.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{record.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(record.amount)}
                </span>

              </TableCell>
              <TableCell>
                {formatDate(record.create_at)}
              </TableCell>
              <TableCell>
                {formatPaymentMethod(record.payment_type)}
              </TableCell>
              <TableCell>
                <span className="text-xs text-gray-500 font-mono">
                  {record.order_id || '-'}
                </span>
              </TableCell>
              <TableCell>
                <Chip
                  color={getStatusColor(record.payment_state)}
                  size="sm"
                  variant="flat"
                >
                  {getStatusText(record.payment_state)}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};