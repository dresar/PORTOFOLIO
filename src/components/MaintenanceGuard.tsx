import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import Maintenance from '@/pages/Maintenance';

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const { settings, isLoading: settingsLoading, error } = useSettings();

  useEffect(() => {
    if (error) {
      console.warn('Failed to fetch site settings:', error);
    }
  }, [error]);

  // Non-blocking: render children immediately, only show maintenance if flag is explicitly true

  const settingsData = Array.isArray(settings) ? settings[0] : settings;
  // Convert boolean string to boolean if necessary, though backend should send boolean
  const isMaintenance = settingsData?.maintenanceMode === true || settingsData?.maintenanceMode === "true";

  if (isMaintenance) {
    return <Maintenance endTime={settingsData?.maintenance_end_time} />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
