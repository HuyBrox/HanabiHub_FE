// Input validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateContent = (content: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Nội dung không được để trống');
  }
  
  if (content.length < 10) {
    errors.push('Nội dung phải có ít nhất 10 ký tự');
  }
  
  if (content.length > 10000) {
    errors.push('Nội dung không được vượt quá 10,000 ký tự');
  }
  
  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  for (const pattern of harmfulPatterns) {
    if (pattern.test(content)) {
      errors.push('Nội dung chứa mã độc hại');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Tiêu đề không được để trống');
  }
  
  if (title.length < 5) {
    errors.push('Tiêu đề phải có ít nhất 5 ký tự');
  }
  
  if (title.length > 200) {
    errors.push('Tiêu đề không được vượt quá 200 ký tự');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim().length === 0) {
    errors.push('Email không được để trống');
  } else if (!emailRegex.test(email)) {
    errors.push('Email không hợp lệ');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFile = (file: File, maxSize: number = 5 * 1024 * 1024): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File không được để trống');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File không được vượt quá ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
  }
  
  // Check file name
  if (file.name.length > 255) {
    errors.push('Tên file quá dài');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

export const validateNotification = (title: string, message: string): ValidationResult => {
  const errors: string[] = [];
  
  const titleValidation = validateTitle(title);
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  }
  
  const messageValidation = validateContent(message);
  if (!messageValidation.isValid) {
    errors.push(...messageValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateScheduledTime = (scheduledDate: Date, scheduledTime: Date): ValidationResult => {
  const errors: string[] = [];
  const now = new Date();
  const scheduledDateTime = new Date(scheduledDate);
  scheduledDateTime.setHours(scheduledTime.getHours());
  scheduledDateTime.setMinutes(scheduledTime.getMinutes());
  
  if (scheduledDateTime <= now) {
    errors.push('Thời gian lên lịch phải trong tương lai');
  }
  
  const maxFutureDate = new Date();
  maxFutureDate.setMonth(maxFutureDate.getMonth() + 6);
  
  if (scheduledDateTime > maxFutureDate) {
    errors.push('Không thể lên lịch quá 6 tháng trong tương lai');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

