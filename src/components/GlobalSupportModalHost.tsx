import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SupportModal from '@/components/SupportModal';

/**
 * Mount once globally. Opens SupportModal when:
 *  - URL has ?support=1 (or ?apoiar=1) on ANY route
 *  - URL pathname is /apoiar or /support
 *
 * On close, removes the trigger from the URL so the user stays on
 * whatever page they were viewing.
 */
export default function GlobalSupportModalHost() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const triggered =
      params.get('support') === '1' ||
      params.get('apoiar') === '1' ||
      location.pathname === '/apoiar' ||
      location.pathname === '/support';
    setOpen(triggered);
  }, [location.search, location.pathname]);

  const handleClose = () => {
    setOpen(false);
    const params = new URLSearchParams(location.search);
    params.delete('support');
    params.delete('apoiar');
    const isDedicatedPath =
      location.pathname === '/apoiar' || location.pathname === '/support';
    const targetPath = isDedicatedPath ? '/' : location.pathname;
    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath, { replace: true });
  };

  return <SupportModal open={open} onClose={handleClose} />;
}
