import { getSecureItem, saveSecureItem } from './security';

/**
 * Advanced Medical Security Logging
 * Tracks critical security events locally for audit purposes.
 */

interface SecurityEvent {
  timestamp: string;
  type: 'LOGIN' | 'LOGOUT' | 'DATA_DELETION' | 'CONSENT_ACCEPTED' | 'BIOMETRIC_TOGGLE';
  details: string;
}

const LOG_KEY = 'eyecare_security_audit_logs';

export const logSecurityEvent = async (type: SecurityEvent['type'], details: string) => {
  try {
    const existingLogsStr = await getSecureItem(LOG_KEY);
    const logs: SecurityEvent[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    
    const newEvent: SecurityEvent = {
      timestamp: new Date().toISOString(),
      type,
      details,
    };
    
    // Keep only the last 50 security events for audit trail
    const updatedLogs = [newEvent, ...logs].slice(0, 50);
    await saveSecureItem(LOG_KEY, JSON.stringify(updatedLogs));
    
    console.log(`[Security Audit] ${type}: ${details}`);
  } catch (error) {
    console.error('Logging security event failed:', error);
  }
};

export const getSecurityLogs = async (): Promise<SecurityEvent[]> => {
  const logsStr = await getSecureItem(LOG_KEY);
  return logsStr ? JSON.parse(logsStr) : [];
};

export const clearSecurityLogs = async () => {
  await saveSecureItem(LOG_KEY, JSON.stringify([]));
};
