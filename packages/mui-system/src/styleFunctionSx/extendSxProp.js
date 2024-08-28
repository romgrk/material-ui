import { isPlainObject } from '@mui/utils/deepmerge';
import defaultSxConfig from './defaultSxConfig';

export default function extendSxProp(props) {
  const config = props?.theme?.unstable_sxConfig ?? defaultSxConfig;

  const inSx = props.sx;
  const otherProps = {};
  let systemProps = undefined;

  // eslint-disable-next-line
  for (const key in props) {
    if (key === 'sx') {
      continue;
    }
    if (config[key]) {
      systemProps ??= {};
      systemProps[key] = props[key];
    } else {
      otherProps[key] = props[key];
    }
  }

  let finalSx;
  if (Array.isArray(inSx)) {
    finalSx = [systemProps, ...inSx];
  } else if (typeof inSx === 'function') {
    finalSx = (...args) => {
      const result = inSx(...args);
      if (!isPlainObject(result)) {
        return systemProps;
      }
      return { ...systemProps, ...result };
    };
  } else if (systemProps || inSx) {
    finalSx = { ...systemProps, ...inSx };
  }

  if (finalSx) {
    otherProps.sx = finalSx;
  }

  return otherProps;
}
