/**
 * 货币格式化工具函数
 */

export interface CurrencyFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}

/**
 * 格式化货币金额
 * @param amount 金额（数字）
 * @param currency 货币代码，如 'USD', 'CNY', 'EUR'
 * @param options 格式化选项
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (
  amount: number | undefined | null,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string => {
  // 处理无效值
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00';
  }

  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options;

  try {
    if (showSymbol) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits,
        maximumFractionDigits
      }).format(amount);
    } else {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits
      });
    }
  } catch (error) {
    // 如果货币代码无效，回退到基本格式化
    console.warn(`Invalid currency code: ${currency}, falling back to basic formatting`);
    return amount.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    });
  }
};

/**
 * 格式化价格（以分为单位转换为元）
 * @param priceInCents 以分为单位的价格
 * @param currency 货币代码
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (
  priceInCents: number | undefined | null,
  currency: string = 'USD',
  options: CurrencyFormatOptions = {}
): string => {
  if (priceInCents === undefined || priceInCents === null || isNaN(priceInCents)) {
    return formatCurrency(0, currency, options);
  }
  
  const priceInDollars = priceInCents / 100;
  return formatCurrency(priceInDollars, currency, options);
};

/**
 * 获取货币符号
 * @param currency 货币代码
 * @returns 货币符号
 */
export const getCurrencySymbol = (currency: string = 'USD'): string => {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    // 格式化0并提取符号
    const formatted = formatter.format(0);
    return formatted.replace(/[\d\s,]/g, '');
  } catch (error) {
    // 回退到常见货币符号
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'KRW': '₩'
    };
    return symbols[currency] || '$';
  }
};

/**
 * 格式化余额显示
 * @param balance 余额
 * @param currency 货币代码
 * @returns 格式化后的余额字符串
 */
export const formatBalance = (
  balance: number | undefined | null,
  currency: string = 'USD'
): string => {
  return formatCurrency(balance, currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * 货币选项接口
 */
export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

/**
 * 获取支持的货币选项列表
 * @returns 货币选项数组
 */
export const getCurrencyOptions = (): CurrencyOption[] => {
  return [
    { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
    { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)', symbol: '¥' },
    { value: 'KRW', label: 'Korean Won (KRW)', symbol: '₩' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
    { value: 'SEK', label: 'Swedish Krona (SEK)', symbol: 'kr' },
    { value: 'NOK', label: 'Norwegian Krone (NOK)', symbol: 'kr' },
    { value: 'DKK', label: 'Danish Krone (DKK)', symbol: 'kr' },
    { value: 'PLN', label: 'Polish Zloty (PLN)', symbol: 'zł' },
    { value: 'CZK', label: 'Czech Koruna (CZK)', symbol: 'Kč' },
    { value: 'HUF', label: 'Hungarian Forint (HUF)', symbol: 'Ft' },
    { value: 'RUB', label: 'Russian Ruble (RUB)', symbol: '₽' },
    { value: 'BRL', label: 'Brazilian Real (BRL)', symbol: 'R$' },
    { value: 'MXN', label: 'Mexican Peso (MXN)', symbol: '$' },
    { value: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
    { value: 'SGD', label: 'Singapore Dollar (SGD)', symbol: 'S$' },
    { value: 'HKD', label: 'Hong Kong Dollar (HKD)', symbol: 'HK$' },
    { value: 'TWD', label: 'Taiwan Dollar (TWD)', symbol: 'NT$' },
    { value: 'THB', label: 'Thai Baht (THB)', symbol: '฿' },
    { value: 'MYR', label: 'Malaysian Ringgit (MYR)', symbol: 'RM' },
    { value: 'IDR', label: 'Indonesian Rupiah (IDR)', symbol: 'Rp' },
    { value: 'PHP', label: 'Philippine Peso (PHP)', symbol: '₱' },
    { value: 'VND', label: 'Vietnamese Dong (VND)', symbol: '₫' },
    { value: 'ZAR', label: 'South African Rand (ZAR)', symbol: 'R' },
    { value: 'TRY', label: 'Turkish Lira (TRY)', symbol: '₺' },
    { value: 'AED', label: 'UAE Dirham (AED)', symbol: 'د.إ' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)', symbol: '﷼' }
  ];
};