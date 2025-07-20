"use client";

import React, { useCallback } from 'react';
import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { MCPServiceAPIItem, MCPServiceFormData } from '@/types/mcp-service';

interface ToolsTabProps {
  formData: MCPServiceFormData;
  onInputChange: (field: keyof MCPServiceFormData, value: any) => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  formData,
  onInputChange
}) => {
  const { t } = useTranslation();

  const handleToolChange = useCallback((index: number, field: keyof MCPServiceAPIItem, value: string) => {
    onInputChange('apis', (formData.apis || []).map((api, i) =>
      i === index ? { ...api, [field]: value } : api
    ));
  }, [formData.apis, onInputChange]);


  return (
    <div className="space-y-4">
      <Table
        aria-label="APIs table"
        removeWrapper
      >
        <TableHeader>
          <TableColumn className='w-1/3'>{t('Tool Name')}</TableColumn>
          <TableColumn>{t('Description')}</TableColumn>
        </TableHeader>
        <TableBody emptyContent={t('No tools added yet. Add your first tool using the input above.')}>
          {(formData.apis || []).map((tool, index) => (
            <TableRow
              key={`tool-${index}`}
            >
              <TableCell>
                <Input
                  value={tool.name}
                  // onChange={(e) => handleToolChange(index, 'name', e.target.value)}
                  size="sm"
                  isDisabled
                />
              </TableCell>
              <TableCell>
                <Input
                  value={tool.description || ''}
                  onChange={(e) => handleToolChange(index, 'description', e.target.value)}
                  size="sm"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};