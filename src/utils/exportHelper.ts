// Export Helper Utilities

export interface ExportOptions {
  filename?: string;
  format?: 'excel' | 'csv';
}

/**
 * Download file from blob response
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (prefix: string, format: string = 'xlsx'): string => {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
  return `${prefix}_${timestamp}.${format}`;
};

/**
 * Handle export response and trigger download
 */
export const handleExportResponse = (
  response: Blob, 
  prefix: string, 
  format: 'excel' | 'csv' = 'excel'
) => {
  const fileExtension = format === 'excel' ? 'xlsx' : 'csv';
  const filename = generateFilename(prefix, fileExtension);
  downloadFile(response, filename);
};

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data: any[], headers: string[]): string => {
  if (!data.length) return '';
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

/**
 * Download CSV data
 */
export const downloadCSV = (data: any[], headers: string[], filename: string) => {
  const csvContent = convertToCSV(data, headers);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

/**
 * Format data for export
 */
export const formatDataForExport = (data: any[], fields: string[]): any[] => {
  return data.map(item => {
    const formattedItem: any = {};
    fields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested fields like 'user.name'
        const keys = field.split('.');
        let value = item;
        for (const key of keys) {
          value = value?.[key];
        }
        formattedItem[field] = value || '';
      } else {
        formattedItem[field] = item[field] || '';
      }
    });
    return formattedItem;
  });
};

/**
 * Common export field mappings
 */
export const exportFieldMappings = {
  notifications: [
    'title',
    'message',
    'type',
    'recipients',
    'recipientCount',
    'sentBy',
    'status',
    'sentAt'
  ],
  news: [
    'title',
    'content',
    'author',
    'status',
    'views',
    'likes',
    'comments',
    'category',
    'tags',
    'createdAt',
    'updatedAt'
  ],
  reports: [
    'reason',
    'description',
    'reporter.name',
    'reporter.email',
    'reportedUser.name',
    'reportedUser.email',
    'status',
    'category',
    'priority',
    'adminNote',
    'createdAt'
  ],
  templates: [
    'name',
    'title',
    'message',
    'type',
    'usageCount',
    'createdAt',
    'updatedAt'
  ],
  users: [
    'name',
    'email',
    'role',
    'isActive',
    'lastLogin',
    'createdAt'
  ]
};



