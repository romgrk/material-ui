import merge from '@mui/utils/fastDeepAssign';
import { getPath, getStyleValue2 } from '../style';
import {
  iterateBreakpoints,
  handleBreakpoints,
  createEmptyBreakpointObject,
  removeUnusedBreakpoints,
  DEFAULT_BREAKPOINTS,
} from '../breakpoints';
import { sortContainerQueries } from '../cssContainerQueries';
import defaultSxConfig from './defaultSxConfig';

const EMPTY_THEME = {};

function objectsHaveSameKeys(a, b) {
  let aLength = 0;
  let bLength = 0;

  /* eslint-disable guard-for-in */
  for (const key in a) {
    aLength += 1;

    if (!(key in b)) {
      return false;
    }
  }

  /* eslint-disable-next-line */
  for (const _ in b) {
    bLength += 1;
  }
  return aLength === bLength;
}

function callIfFn(maybeFn, arg) {
  return typeof maybeFn === 'function' ? maybeFn(arg) : maybeFn;
}

function setThemeValue(css, prop, value, theme, config) {
  const options = config[prop];

  if (!options) {
    css[prop] = value;
    return;
  }

  if (value == null) {
    return;
  }

  const { themeKey } = options;
  // TODO v6: remove, see https://github.com/mui/material-ui/pull/38123
  if (themeKey === 'typography' && value === 'inherit') {
    css[prop] = value;
    return;
  }

  const { style } = options;
  if (style) {
    merge(css, style({
      [prop]: value,
      theme,
    }));
    return;
  }

  const { cssProperty = prop, transform } = options;
  const themeMapping = getPath(theme, themeKey);

  iterateBreakpoints(css, theme, value, (target, key, valueFinal) => {
    const value = getStyleValue2(themeMapping, transform, valueFinal, prop);

    if (cssProperty === false) {
      if (key) {
        target[key] = value;
      } else {
        merge(target, value);
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (key) {
        target[key][cssProperty] = value;
      } else {
        target[cssProperty] = value;
      }
    }
  });
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function unstable_createStyleFunctionSx() {
  function styleFunctionSx(props) {
    if (!props.sx) {
      return null;
    }

    const { sx, theme = EMPTY_THEME } = props;

    const config = theme.unstable_sxConfig ?? defaultSxConfig;

    // Pass argument without loop allocations
    const wrapper = { sx: null, theme };

    function process(sxInput) {
      let sxObject = sxInput;
      if (typeof sxInput === 'function') {
        sxObject = sxInput(theme);
      } else if (typeof sxInput !== 'object') {
        // value
        return sxInput;
      }
      if (!sxObject) {
        return null;
      }

      const breakpoints = theme.breakpoints ?? DEFAULT_BREAKPOINTS;

      const emptyBreakpoints = createEmptyBreakpointObject(breakpoints);
      const breakpointsKeys = breakpoints.mediaKeys;

      const css = emptyBreakpoints;

      for (const styleKey in sxObject) {
        const value = callIfFn(sxObject[styleKey], theme);
        if (value === null || value === undefined) {
          continue;
        }
        if (typeof value !== 'object') {
          setThemeValue(css, styleKey, value, theme, config);
          continue;
        }
        if (config[styleKey]) {
          setThemeValue(css, styleKey, value, theme, config);
          continue;
        }

        debugger
        const breakpointsValues = handleBreakpoints(wrapper, value, (x) => ({
          [styleKey]: x,
        }));

        if (objectsHaveSameKeys(breakpointsValues, value)) {
          wrapper.sx = value;
          css[styleKey] = styleFunctionSx(wrapper);
        } else {
          merge(css, breakpointsValues);
        }
      }

      return sortContainerQueries(theme, removeUnusedBreakpoints(breakpointsKeys, css));
    }

    return Array.isArray(sx) ? sx.map(process) : process(sx);
  }

  return styleFunctionSx;
}

const styleFunctionSx = unstable_createStyleFunctionSx();

styleFunctionSx.filterProps = ['sx'];

export default styleFunctionSx;
