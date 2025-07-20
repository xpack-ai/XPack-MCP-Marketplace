'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidatePlatformConfig() {
  // 重新验证根路径和所有子路径
  revalidatePath('/', 'layout');
  
  // 如果使用了标签缓存，也可以重新验证特定标签
  revalidateTag('platform-config');
  
  console.log('Platform config cache revalidated');
}