// Audit logging utilities
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLog[] = [];

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public log(action: string, resource: string, resourceId: string, details: Record<string, any>, userId: string = 'admin', userName: string = 'Admin'): void {
    const log: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userName,
      action,
      resource,
      resourceId,
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    this.logs.push(log);
    
    // In production, this would send to a logging service
    console.log('Audit Log:', log);
  }

  public getLogs(): AuditLog[] {
    return [...this.logs];
  }

  public getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  public getLogsByResource(resource: string, resourceId?: string): AuditLog[] {
    return this.logs.filter(log => 
      log.resource === resource && 
      (!resourceId || log.resourceId === resourceId)
    );
  }

  public getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter(log => log.action === action);
  }

  public getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getClientIP(): string {
    // In production, this would be provided by the server
    return '127.0.0.1';
  }
}

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // Content actions
  CREATE_CONTENT: 'CREATE_CONTENT',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  DELETE_CONTENT: 'DELETE_CONTENT',
  PUBLISH_CONTENT: 'PUBLISH_CONTENT',
  UNPUBLISH_CONTENT: 'UNPUBLISH_CONTENT',
  
  // Notification actions
  SEND_NOTIFICATION: 'SEND_NOTIFICATION',
  SCHEDULE_NOTIFICATION: 'SCHEDULE_NOTIFICATION',
  CANCEL_NOTIFICATION: 'CANCEL_NOTIFICATION',
  
  // Report actions
  APPROVE_REPORT: 'APPROVE_REPORT',
  REJECT_REPORT: 'REJECT_REPORT',
  UPDATE_REPORT_STATUS: 'UPDATE_REPORT_STATUS',
  
  // Template actions
  CREATE_TEMPLATE: 'CREATE_TEMPLATE',
  UPDATE_TEMPLATE: 'UPDATE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  USE_TEMPLATE: 'USE_TEMPLATE',
  
  // User actions
  SELECT_USERS: 'SELECT_USERS',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // System actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_SETTINGS: 'CHANGE_SETTINGS'
} as const;

// Predefined resources
export const AUDIT_RESOURCES = {
  CONTENT: 'CONTENT',
  NOTIFICATION: 'NOTIFICATION',
  REPORT: 'REPORT',
  TEMPLATE: 'TEMPLATE',
  USER: 'USER',
  SYSTEM: 'SYSTEM'
} as const;

// Helper functions for common audit scenarios
export const auditContentAction = (action: string, contentId: string, contentTitle: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.CONTENT, contentId, {
    contentTitle,
    ...details
  });
};

export const auditNotificationAction = (action: string, notificationId: string, title: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.NOTIFICATION, notificationId, {
    title,
    ...details
  });
};

export const auditReportAction = (action: string, reportId: string, reason: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.REPORT, reportId, {
    reason,
    ...details
  });
};

export const auditTemplateAction = (action: string, templateId: string, templateName: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.TEMPLATE, templateId, {
    templateName,
    ...details
  });
};

export const auditUserAction = (action: string, userId: string, userName: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.USER, userId, {
    userName,
    ...details
  });
};

export const auditSystemAction = (action: string, details: Record<string, any> = {}) => {
  const logger = AuditLogger.getInstance();
  logger.log(action, AUDIT_RESOURCES.SYSTEM, 'system', details);
};

