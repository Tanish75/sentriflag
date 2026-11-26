import flagsmith from '@flagsmith/flagsmith';

const ENV_KEY = 'FvQtv7AjNQt7uz338VJ6Yg';

export const initFlagsmith = (onChange) =>
  flagsmith.init({
    environmentID: ENV_KEY,
    onChange,
    cacheFlags: false,
    enableLogs: false
  });

export const refreshFlags = async () => {
  try {
    await flagsmith.getFlags();
  } catch (e) {
    console.warn('Flagsmith refresh error', e);
  }
};

export const getVal = (key, fallback = null) => {
  try { return flagsmith.getValue(key) ?? fallback; }
  catch { return fallback; }
};

export const hasFlag = (key) => {
  try { return flagsmith.hasFeature(key); }
  catch { return false; }
};

export const getFlagCount = () => {
  try { return Object.keys(flagsmith.getAllFlags() || {}).length; }
  catch { return 0; }
};

export const identifyUser = (userId, traits = {}) => {
  try { flagsmith.identify(userId, traits); }
  catch (e) { console.warn('Flagsmith identify error', e); }
};

export default flagsmith;
